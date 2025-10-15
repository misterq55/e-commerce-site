import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'
import { AppDataSource } from '../data-source'
import { User } from "../entities/User";

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token

        // 토큰이 없으면 비로그인 유저로 통과
        if (!token) {
            return next()
        }

        // 토큰 검증
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)

        const user = await AppDataSource.getRepository(User)
            .findOneBy({ email: decoded.email })

        // 유저 정보를 res.locals에 저장
        if (user) {
            res.locals.user = user
        }

        return next()
    } catch (error) {
        console.log(error)
        // 토큰이 잘못되었어도 그냥 통과 (인증 체크는 auth 미들웨어에서)
        return next()
    }
}
