import { Request, Response, NextFunction, Router } from "express"
import { Product } from "../entities/Product"
import { AppDataSource } from '../data-source'
import authMiddleware from '../middlewares/auth'
import userMiddleware from '../middlewares/user'

const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productRepository = AppDataSource.getRepository(Product)

        const product = productRepository.create(req.body)
        await productRepository.save(product)

        return res.status(201).json({ product })
    } catch (error) {
        next(error)
    }
}

const router = Router()
router.post("/", userMiddleware, authMiddleware, createProduct)

export default router;