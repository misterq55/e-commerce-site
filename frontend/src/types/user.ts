export interface CartItem {
  productId: number
  quantity: number
}

export interface User {
  id: number
  email: string
  name: string
  role: number
  image?: string
  cart?: CartItem[]
}
