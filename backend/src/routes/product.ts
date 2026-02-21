import { Request, Response, NextFunction, Router } from "express"
import { Product } from "../entities/Product"
import { AppDataSource } from '../data-source'
import authMiddleware from '../middlewares/auth'
import userMiddleware from '../middlewares/user'
import multer, { FileFilterCallback } from "multer"
import path from 'path'
import fs from 'fs'

// uploads 폴더 생성
const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
        cb(null, uploadDir)
    },
    filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
        cb(null, `${Date.now()}_${file.originalname}`)
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
        const mimetype = allowedTypes.test(file.mimetype)

        if (extname && mimetype) {
            cb(null, true)
        } else {
            cb(new Error('이미지 파일만 업로드 가능합니다.'))
        }
    }
}).single('file')

const uploadImage = (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (err: any) => {
        if (err) {
            return res.status(500).json({ message: err.message })
        }

        if (!req.file) {
            return res.status(400).json({ message: '파일이 없습니다.' })
        }

        return res.json({ fileName: req.file.filename })
    })
}

const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productRepository = AppDataSource.getRepository(Product)

        // 쿼리 파라미터 추출
        const { skip = 0, limit = 8, filters = {}, searchTerm = '' } = req.query

        // QueryBuilder 생성
        let query = productRepository.createQueryBuilder('product')

        // 검색어 필터링 (제목 또는 설명에서 검색)
        if (searchTerm && typeof searchTerm === 'string') {
            query = query.where(
                'product.title LIKE :searchTerm OR product.description LIKE :searchTerm',
                { searchTerm: `%${searchTerm}%` }
            )
        }

        // 필터링 (continents, price 등)
        if (filters && typeof filters === 'string') {
            const parsedFilters = JSON.parse(filters)

            // Continents 필터
            if (parsedFilters.continents && parsedFilters.continents.length > 0) {
                query = query.andWhere('product.continents IN (:...continents)', {
                    continents: parsedFilters.continents
                })
            }

            // Price 필터 (예: [0, 100], [100, 200])
            if (parsedFilters.prices && parsedFilters.prices.length > 0) {
                const [minPrice, maxPrice] = parsedFilters.prices
                query = query.andWhere('product.price >= :minPrice AND product.price <= :maxPrice', {
                    minPrice,
                    maxPrice
                })
            }
        }

        // 총 개수 확인 (hasMore 계산용)
        const total = await query.getCount()

        // 페이지네이션 적용
        query = query
            .orderBy('product.id', 'DESC')  // 최신순 정렬
            .skip(Number(skip))
            .take(Number(limit))

        // 상품 조회
        const products = await query.getMany()

        // hasMore 계산
        const hasMore = Number(skip) + products.length < total

        return res.status(200).json({
            products,
            hasMore
        })
    } catch (error) {
        next(error)
    }
}

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

const findProducts = async (req: Request, res: Response, next: NextFunction) => {
    const type = req.query.type;
    const productId = req.params.id;

    if (!productId) {
        return res.status(400).json({ message: '상품 ID가 필요합니다.' })
    }

    try {
        const productRepository = AppDataSource.getRepository(Product)
        let products = []

        if (type === 'single') {
            // 단일 상품 조회
            const product = await productRepository.findOne({
                where: { id: Number(productId) }
            })

            if (!product) {
                return res.status(404).json({ message: '상품을 찾을 수 없습니다.' })
            }

            products = [product]
        } else {
            // 여러 상품 조회 (쉼표로 구분된 ID들)
            const ids = productId.split(',').map(id => Number(id.trim()))
            products = await productRepository.findByIds(ids)
        }

        return res.status(200).json(products)
    } catch (error) {
        next(error)
    }
}

const router = Router()
router.get('/', getProducts)
router.post('/', userMiddleware, authMiddleware, createProduct)
router.post('/image', userMiddleware, authMiddleware, uploadImage)
router.get('/:id', findProducts)

export default router;