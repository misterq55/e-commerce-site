import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "../store/store"
import { getCartItems } from "../store/userSlice"

const CartPage = () => {
  const userData = useSelector((state: RootState) => state.user?.user);
  const dispatch = useDispatch<AppDispatch>();

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
  return (
    <div>
      장바구니 페이지 입니다
    </div>
  )
}

export default CartPage
