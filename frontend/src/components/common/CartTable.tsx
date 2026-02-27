import type { CartDetail } from "../../store/userSlice"

interface Props {
    products: CartDetail[]
    onRemoveItem: (productId: number) => void
}

const CartTable = ({ products, onRemoveItem }: Props) => {

    const renderCartImage = (images: string[]) => {
        if (images.length > 0) {
            let image = images[0]
            return `${import.meta.env.VITE_API_URL}/${image}`
        }
    }

    const renderItems = (
        products.length > 0 && products.map(product => (
            <tr key={product.id}>
                <td>
                    <img
                        className="w-[70px]"
                        alt='product'
                        src={renderCartImage(product.images)}
                        />
                </td>
                <td>
                    {product.quantity} 개
                </td>
                <td>
                    {product.price} 원
                </td>
                <td>
                    <button onClick={() => onRemoveItem(product.id)}>
                        지우기
                    </button>
                </td>
            </tr>
        ))
    )

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
                {renderItems}
            </tbody>
        </table>
    )
}

export default CartTable
