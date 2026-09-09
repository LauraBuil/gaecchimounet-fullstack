// React et & React-dom
import { Outlet } from 'react-router'

// Components
import Header from './components/components/Header.tsx'
import Footer from './components/components/Footer.tsx'
import ScrollToTop from './components/adds/ScrollToTop.tsx'

export default function App() {
    return (
        <>
            <ScrollToTop />
            <Header />
            <Outlet />
            <Footer />
        </>
    )
}