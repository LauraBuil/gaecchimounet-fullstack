// React et & React-dom
import { Outlet } from 'react-router'

// Components
import Header from './components/components/Header.tsx'
import Footer from './components/components/Footer.tsx'
import ScrollToTop from './components/adds/ScrollToTop.tsx'
import PageViewTracker from './components/adds/PageViewTracker.tsx'

export default function App() {
    return (
        <>
            <ScrollToTop />
            <PageViewTracker />
            <Header />
            <Outlet />
            <Footer />
        </>
    )
}
