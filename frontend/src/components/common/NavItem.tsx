import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export interface NavItemData {
  path: string
  label: string
  icon?: React.ReactNode
  badge?: number
  children?: NavItemData[]
}

interface NavItemProps {
  item: NavItemData
}

const NavItem = ({ item }: NavItemProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const isActive = location.pathname === item.path
  const hasChildren = item.children && item.children.length > 0

  const handleMouseEnter = () => {
    if (hasChildren) setIsOpen(true)
  }

  const handleMouseLeave = () => {
    if (hasChildren) setIsOpen(false)
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {hasChildren ? (
        <button
          className={`
            px-4 py-2 rounded transition-colors inline-flex items-center gap-2 relative
            text-gray-200 hover:bg-gray-700 hover:text-white
          `}
          onClick={() => setIsOpen(!isOpen)}
        >
        {item.icon && <span>{item.icon}</span>}
        <span>{item.label}</span>
        {hasChildren && (
          <span className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>
        )}
        {/* 뱃지 */}
        {item.badge !== undefined && item.badge > 0 && (
          <li className='relative py-2 text-center border-b-4 cursor-pointer'>
            <span className="absolute top-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -right-3">
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          </li>
        )}
        </button>
      ) : (
        <Link
          to={item.path}
          className={`
            px-4 py-2 rounded transition-colors inline-flex items-center gap-2 relative
            ${isActive
              ? 'bg-gray-700 text-white'
              : 'text-gray-200 hover:bg-gray-700 hover:text-white'
            }
          `}
        >
          {item.icon && <span>{item.icon}</span>}
          <span>{item.label}</span>
          {/* 뱃지 */}
          {item.badge !== undefined && item.badge > 0 && (
            <li className='relative py-2 text-center border-b-4 cursor-pointer'>
              <span className="absolute top-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -right-3">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            </li>
          )}
        </Link>
      )}

      {/* 드롭다운 메뉴 */}
      {hasChildren && isOpen && (
        <div
          className="absolute top-full left-0 bg-white shadow-lg rounded-md py-2 min-w-[200px] z-50"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {item.children!.map((child, index) => (
            <Link
              key={index}
              to={child.path}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {child.icon && <span className="mr-2">{child.icon}</span>}
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default NavItem
