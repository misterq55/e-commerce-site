import { Request, Response, Router } from "express";
import { validate } from 'class-validator'
import { AppDataSource } from '../data-source'
import { User } from "../entities/User";

const register = async (req: Request, res: Response) => {
  const { email, name, password } = req.body;

  try {
    let errors: any = {};

    const userRepository = AppDataSource.getRepository(User)
    const emailUser = await userRepository.findOneBy({ email })
    const nameUser = await userRepository.findOneBy({ name })

    if (emailUser) errors.email = "이미 해당 이메일 주소가 사용되었습니다."
    if (nameUser) errors.name = "이미 해당 이름이 사용되었습니다."

    const user = new User();
    user.email = email
    user.name = name
    user.password = password

    errors = await validate(user)
    console.log('errors', errors)

    await userRepository.save(user)
    res.status(201).json({ user })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error })
  }
}

const router = Router()
router.post("/register", register)

export default router;