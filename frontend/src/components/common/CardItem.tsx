import { Link } from 'react-router-dom'
import type { Product } from '../../types/product'
import ImageSlider from './ImageSlider';
import { continents } from '../../utils/filterData';

interface CardItemProps {
    product: Product;
}

const CardItem = ({ product }: CardItemProps) => {
    return (
        <div className='border-[1px] border-gray-300'>
            <ImageSlider images={product.images}/>
            <Link to={`/product/${product.id}`}>
                <p className='p-1'>{product.title}</p>
                <p className='p-1'>{continents.find(c => c._id === product.continents)?.name}</p>
                <p className='p-1 text-xs text-gray-500'>{product.price}원</p>
            </Link>
        </div>
    )
}

export default CardItem
