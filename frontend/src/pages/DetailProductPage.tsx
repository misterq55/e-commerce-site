import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import type { Product } from '../types/product'
import axiosInstance from '../api/axios'
import ProductImage from "../components/common/ProductImage"
import ProductInfo from "../components/common/ProductInfo"

const DetailProductPage = () => {
  const { productId } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axiosInstance.get(`/api/products/${productId}?type=single`)
        setProduct(response.data[0])
      } catch (error) {
        console.error(error)
        setError('상품을 불러올 수 없습니다')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  // Early return으로 null 체크 (Type Narrowing)
  if (loading) {
    return <div className="text-center p-8">로딩 중...</div>
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>
  }

  if (!product) {
    return <div className="text-center p-8">상품을 찾을 수 없습니다</div>
  }

  // 이 시점부터 product는 절대 null이 아님
  return (
    <section>
      <div className="text-center">
        <h1 className="p-4 text-2xl">{product.title}</h1>
      </div>
      <div className="flex gap-4">
        <div className="w-1/2">
          <ProductImage product={product} />
        </div>
        <div className="w-1/2">
          <ProductInfo product={product} />
        </div>
      </div>
    </section>
  )
}

export default DetailProductPage
