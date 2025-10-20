import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store/store'
import UserInfo from '../common/UserInfo'
import NavItem, { type NavItemData } from '../common/NavItem'
import { AiOutlineShoppingCart } from 'react-icons/ai'
import { MdHistory } from 'react-icons/md'
import { FiPackage, FiUpload, FiList } from 'react-icons/fi'

function NavBar() {
  const { user } = useSelector((state: RootState) => state.user)

  // TODO: Redux에서 장바구니 개수 가져오기
  const cartItemCount = 3 // 임시 값, 나중에 Redux state로 변경

  const navItems: NavItemData[] = [
    {
      path: '/products',
      label: '상품',
      children: [
        { path: '/product/upload', label: '상품 등록' },
        // { path: '/products/list', label: '상품 목록' },
      ]
    },
    {
      path: '/user/cart',
      label: '',
      icon: <AiOutlineShoppingCart className="text-3xl" />,
      badge: cartItemCount
    },
    { path: '/history', label: '구매내역' },
  ]

  return (
    <nav className="bg-black border-b border-gray-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link
            to="/"
            className="text-white text-2xl sm:text-3xl font-semibold hover:text-gray-300 transition-colors"
          >
            LOGO
          </Link>

          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* 네비게이션 메뉴 */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item, index) => (
                <NavItem key={index} item={item} />
              ))}
            </div>
            {user ? (
              <UserInfo />
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
