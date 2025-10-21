import { Outlet } from 'react-router-dom'
import NavBar from './NavBar'
import Footer from './Footer'

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
