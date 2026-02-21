import { useEffect, useState } from 'react'
import ImageGallery from 'react-image-gallery'
import 'react-image-gallery/styles/css/image-gallery.css'
import type { Product } from '../../types/product'

interface ProductImageProps {
  product: Product
}

interface ImageItem {
  original: string
  thumbnail: string
}

const ProductImage = ({ product }: ProductImageProps) => {
  const [images, setImages] = useState<ImageItem[]>([])

  useEffect(() => {
    if (product.images && product.images.length > 0) {
      const formattedImages = product.images.map((imageName: string) => ({
        original: `${import.meta.env.VITE_API_URL}/${imageName}`,
        thumbnail: `${import.meta.env.VITE_API_URL}/${imageName}`
      }))
      setImages(formattedImages)
    }
  }, [product])

  return <ImageGallery items={images} />
}

export default ProductImage
