// React et & React-dom
import { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'

// Styles
import './assets/scss/index.scss'

// Site public
import App from './App.tsx'

// Authentification
import AuthProvider from './features/auth/AuthProvider.tsx'
import RequireRole from './features/auth/RequireRole.tsx'

// Espace de gestion
const HomePage = lazy(() => import('./components/pages/HomePage.tsx'))
const LegalMentions = lazy(() => import('./components/pages/LegalMentions.tsx'))
const Contact = lazy(() => import('./components/pages/Contact.tsx'))
const Gallery = lazy(() => import('./components/pages/Gallery.tsx'))
const Recipy = lazy(() => import('./components/pages/Recipy.tsx'))
const RecipeDetailPage = lazy(() => import('./components/pages/RecipeDetailPage'))
const ProductsPage = lazy(() => import('./components/pages/ProductsPage.tsx'))
const NotFoundPage = lazy(() => import('./components/pages/NotFoundPage.tsx'))
const PrivacyPolicyPage = lazy(() => import('./components/pages/PrivacyPolicyPage.tsx'))
const LoginPage = lazy(() => import('./features/auth/LoginPage.tsx'))
const UpdatePasswordPage = lazy(() => import('./features/auth/UpdatePasswordPage.tsx'))
const AdminLayout = lazy(() => import('./components/admin/AdminLayout.tsx'))
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard.tsx'))
const AdminRecipesPage = lazy(() => import('./components/admin/recipes/AdminRecipesPage.tsx'))
const AdminRecipeFormPage = lazy(() => import('./components/admin/recipes/AdminRecipeFormPage.tsx'))
const AdminGalleryPage = lazy(() => import('./components/admin/gallery/AdminGalleryPage.tsx'))
const AdminProductsPage = lazy(() => import('./components/admin/products/AdminProductsPage.tsx'))
const AdminMeetingPointsPage = lazy(() => import('./components/admin/meetingPoints/AdminMeetingPointsPage.tsx'))
const AdminUsersPage = lazy(() => import('./components/admin/users/AdminUsersPage.tsx'))

const router = createBrowserRouter([
    {
        element: <App />,
        children: [
            { index: true, element: <HomePage /> },
            { path: '/galerie', element: <Gallery /> },
            { path: '/recettes', element: <Recipy /> },
            { path: 'recettes/:slug', element: <RecipeDetailPage /> },
            { path: '/produits', element: <ProductsPage /> },
            { path: '/contact', element: <Contact /> },
            { path: '/mentions-legales', element: <LegalMentions /> },
            { path: '/politique-de-confidentialite', element: <PrivacyPolicyPage /> },
            { path: '*', element: <NotFoundPage /> },
        ],
    },

    // Hors du gabarit public : ces écrans n'ont ni en-tête ni pied de page.
    { path: '/admin/connexion', element: <LoginPage /> },
    { path: '/admin/mot-de-passe', element: <UpdatePasswordPage /> },

    {
        // Route sans chemin : sert uniquement à protéger tout ce qui suit.
        element: <RequireRole level="staff" />,
        children: [
            {
                path: '/admin',
                element: <AdminLayout />,
                children: [
                    { index: true, element: <AdminDashboard /> },
                    { path: 'recettes', element: <AdminRecipesPage /> },
                    // « nouvelle » avant « :id », sinon il serait pris pour un identifiant.
                    { path: 'recettes/nouvelle', element: <AdminRecipeFormPage /> },
                    { path: 'recettes/:id', element: <AdminRecipeFormPage /> },
                    { path: 'galerie', element: <AdminGalleryPage /> },
                    { path: 'produits', element: <AdminProductsPage /> },
                    {
                        path: 'points-de-distribution',
                        element: <AdminMeetingPointsPage />,
                    },
                    {
                        element: <RequireRole level="admin" />,
                        children: [
                            { path: 'utilisateurs', element: <AdminUsersPage /> },
                        ],
                    },
                ],
            },
        ],
    },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
    <AuthProvider>
        <Suspense fallback={<div className="admin-splash"><p>Chargement…</p></div>}>
            <RouterProvider router={router} />
        </Suspense>
    </AuthProvider>
)
