import { Outlet } from 'react-router-dom'
import NavBar from './NavBar'
import Footer from './Footer'

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow flex">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
