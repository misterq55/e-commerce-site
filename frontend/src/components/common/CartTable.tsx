import type { CartProduct } from "../../types/product"

interface Props {
    products: CartProduct[]
    onRemoveItem: (productId: number) => void
}

const CartTable = ({ products, onRemoveItem }: Props) => {

    const renderCartImage = (images: string[]): string => {
        if (images.length > 0) {
            return `${import.meta.env.VITE_API_URL}/${images[0]}`
        }
        return 'https://placehold.co/70x70?text=No+Image'
    }

    return (
        <table className="w-full text-sm text-left text-gray-500">
            <thead className="border-[1px]">
                <tr>
                    <th>사진</th>
                    <th>개수</th>
                    <th>가격</th>
                    <th>삭제</th>
                </tr>
            </thead>

            <tbody>
                {products.map(product => (
                    <tr key={product.id}>
                        <td>
                            <img
                                className="w-[70px]"
                                alt='product'
                                src={renderCartImage(product.images)}
                            />
                        </td>
                        <td>{product.quantity} 개</td>
                        <td>{product.price} 원</td>
                        <td>
                            <button onClick={() => onRemoveItem(product.id)}>
                                지우기
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default CartTable
