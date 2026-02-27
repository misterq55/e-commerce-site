import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { Product } from '../../types/product'
import type { RootState, AppDispatch } from '../../store/store'
import { addToCart } from '../../store/userSlice'

interface ProductInfoProps {
    product: Product
}

const ProductInfo = ({ product }: ProductInfoProps) => {
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const user = useSelector((state: RootState) => state.user?.user)

    const handleClick = () => {
        if (!user) {
            navigate('/login')
            return
        }
        dispatch(addToCart({ productId: product.id }))
    }

    return (
        <div className="space-y-4">
            {/* 가격 */}
            <div className="border-b pb-4">
                <p className="text-3xl font-bold text-gray-900">
                    ₩{product.price.toLocaleString()}
                </p>
            </div>

            {/* 상품 설명 */}
            <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-2">상품 설명</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
            </div>

            {/* 상품 정보 */}
            <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-2">상품 정보</h3>
                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                        <span>조회수:</span>
                        <span>{product.views.toLocaleString()}회</span>
                    </div>
                    <div className="flex justify-between">
                        <span>판매량:</span>
                        <span>{product.sold.toLocaleString()}개</span>
                    </div>
                </div>
            </div>

            {/* 버튼 그룹 */}
            <div className="space-y-2 pt-4">
                <button
                    onClick={handleClick}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                >
                    장바구니 담기
                </button>
                <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition">
                    바로 구매
                </button>
            </div>
        </div>
    )
}

export default ProductInfo
