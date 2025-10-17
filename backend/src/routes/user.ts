import { Request, Response, Router } from "express";
import { isEmpty, validate } from 'class-validator'
import { AppDataSource } from '../data-source'
import { User } from "../entities/User";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import authMiddleware from '../middlewares/auth'
import userMiddleware from '../middlewares/user'

const me = async (req: Request, res: Response) => {
    return res.json(res.locals.user)
}

const register = async (req: Request, res: Response) => {
    const { email, name, password } = req.body;

    try {
        let errors: any = {};

        const userRepository = AppDataSource.getRepository(User)
        const emailUser = await userRepository.findOneBy({ email })
        const nameUser = await userRepository.findOneBy({ name })

        if (emailUser) errors.email = "이미 해당 이메일 주소가 사용되었습니다."
        if (nameUser) errors.name = "이미 해당 이름이 사용되었습니다."

        if (Object.keys(errors).length > 0) {
            console.log('errors', errors)
            return res.status(400).json(errors)
        }

        const user = new User();
        user.email = email
        user.name = name
        user.password = password

        errors = await validate(user)

        if (Object.keys(errors).length > 0) {
            console.log('errors', errors)
            return res.status(400).json(errors)
        }

        await userRepository.save(user)

        // 회원가입 성공 시 자동 로그인 (토큰 발급)
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET!, { expiresIn: '7d' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
        })

        const { password: _, ...userWithoutPassword } = user
        res.status(201).json({ user: userWithoutPassword })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error })
    }
}

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        let errors: any = {};

        if (isEmpty(email)) errors.email = "이메일은 비워둘 수 없습니다"
        if (isEmpty(password)) errors.password = "비밀번호는 비워둘 수 없습니다"
        if (Object.keys(errors).length > 0) {
            console.log('errors', errors)
            return res.status(400).json(errors)
        }

        const userRepository = AppDataSource.getRepository(User)
        const foundUser = await userRepository.findOneBy({ email })

        if (!foundUser) return res.status(404).json({ email: "해당 이메일로 가입된 계정이 없습니다" })

        const passwordMatches = await bcrypt.compare(password, foundUser!.password)

        if (!passwordMatches) return res.status(401).json({ password: "비밀번호가 잘못되었습니다" })

        const token = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '7d' })

        // HttpOnly Cookie로 토큰 전송
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000 // 1시간
        })

        const { password: _, ...userWithoutPassword } = foundUser
        return res.json({ user: userWithoutPassword })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error })
    }
}

const logout = async (req: Request, res: Response) => {
    res.cookie('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0) // 즉시 만료
        })

    return res.status(200).json({ success: true })
}

const router = Router()
router.get("/me", userMiddleware, authMiddleware, me)
router.post("/register", register)
router.post("/login", login)
router.post("/logout", userMiddleware, authMiddleware, logout)

export default router;