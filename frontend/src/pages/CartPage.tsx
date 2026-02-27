import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "../store/store"
import { getCartItems, removeCartItem, type CartDetail } from "../store/userSlice"
import CartTable from "../components/common/CartTable";

const CartPage = () => {
  const userData = useSelector((state: RootState) => state.user?.user);
  const cartDetail = useSelector((state: RootState) => state.user?.cartDetail);
  console.log(cartDetail)
  const dispatch = useDispatch<AppDispatch>();
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const cartItemIds: number[] = []

    if (userData?.cart && userData.cart.length > 0) {
      userData.cart.forEach((item) => {
        cartItemIds.push(item.productId)
      })

      const body = {
        cartItemIds,
        userCart: userData.cart
      }

      dispatch(getCartItems(body))
    }
  }, [dispatch, userData])

  useEffect(() => {
    if (cartDetail && cartDetail.length > 0) {
      calulateTotal(cartDetail)
    }
  }, [cartDetail])

  const calulateTotal = (cartItems : CartDetail[]) => {
    let total = 0;
    cartItems.map(item => total += item.price * item.quantity)
    setTotal(total);
  }

  const handleRemoveCartItems = (productId: number) => {
    dispatch(removeCartItem({ productId }))
  }

  return (
    <section>
      <div className="text-center m-7">
        <h2 className="text-2xl">나의 장바구니</h2>
      </div>

      {cartDetail?.length > 0 ?
        <>
          <CartTable products={cartDetail} onRemoveItem={handleRemoveCartItems}/>
          <div className="mt-10">
            <p><span className="font-bold">합계:</span>{total}원</p>
            <button className="px-4 py-2 mt-5 text-white bg-black rounded-md">
              결제하기
            </button>
          </div>
        </> 
        : 
        <p>장바구니가 비였습니다</p>
      }
    </section>
  )
}

export default CartPage
