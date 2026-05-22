import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import PrivateRoute from './components/layout/PrivateRoute';
import AdminRoute from './components/layout/AdminRoute';
import ImportadoraRoute from './components/layout/ImportadoraRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import HomePage from './pages/HomePage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import MisProductosPage from './pages/importadora/MisProductosPage';
import SubirProductoPage from './pages/importadora/SubirProductoPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import Navbar from './components/layout/Navbar';



const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
          <div className="min-h-screen bg-background pt-16 overflow-x-hidden">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/productos" element={<ProductsPage />} />
              <Route path="/productos/:id" element={<ProductDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />
              <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
              <Route path="/carrito" element={<CartPage />} />

              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/perfil" element={<ProfilePage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/pedidos" element={<OrdersPage />} />
              </Route>

              {/* Importadora Routes */}
              <Route element={<ImportadoraRoute />}>
                <Route path="/importadora/productos" element={<MisProductosPage />} />
                <Route path="/importadora/subir" element={<SubirProductoPage />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<div className="p-8">Admin Dashboard - Resumen</div>} />
                <Route path="/admin/usuarios" element={<AdminUsersPage />} />
                <Route path="/admin/inventario" element={<AdminInventoryPage />} />
              </Route>
            </Routes>

            {/* Global Floating WhatsApp Support Button */}
            <a 
              href="https://wa.me/59170000000?text=Hola%20Importadora%20Market%21%20👋%20Quisiera%20hacer%20una%20consulta."
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-6 right-6 z-40 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group flex items-center justify-center cursor-pointer"
              title="Soporte WhatsApp"
            >
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.424 2.5 1.134 3.471L6.5 18.5l3.181-.832a5.727 5.727 0 0 0 2.35.513h.002c3.182 0 5.769-2.586 5.77-5.766 0-3.18-2.587-5.766-5.772-5.766zm3.385 8.163c-.147.415-.852.766-1.173.811-.321.045-.634.07-.942-.023-.309-.092-1.077-.425-2.022-1.267-.735-.654-1.233-1.464-1.378-1.712-.145-.248-.016-.381.109-.506.112-.113.248-.292.372-.439.124-.146.166-.248.248-.415.083-.166.041-.314-.02-.439-.062-.124-.559-1.348-.766-1.848-.202-.488-.406-.421-.559-.429-.145-.008-.31-.01-.476-.01-.165 0-.434.062-.661.309-.227.247-.867.848-.867 2.07 0 1.221.888 2.4 1.012 2.565.124.166 1.747 2.668 4.232 3.74.591.255 1.053.407 1.412.521.593.189 1.134.162 1.562.098.477-.071 1.472-.601 1.679-1.183.207-.582.207-1.08.145-1.183-.062-.104-.227-.166-.476-.29z" />
                <path d="M12.5 2C6.701 2 2 6.701 2 12.5c0 1.956.541 3.785 1.479 5.354L2 23.5l5.807-1.524A10.457 10.457 0 0 0 12.5 23c5.799 0 10.5-4.701 10.5-10.5S18.299 2 12.5 2zm0 19c-1.733 0-3.358-.48-4.742-1.314l-.34-.204-3.522.924.94-3.434-.224-.356A8.455 8.455 0 0 1 4 12.5C4 7.813 7.813 4 12.5 4 17.187 4 21 7.813 21 12.5 21 17.187 17.187 21 12.5 21z" />
              </svg>
              {/* Premium Hover Card */}
              <span className="absolute right-16 scale-0 group-hover:scale-100 origin-right transition-all duration-300 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl whitespace-nowrap shadow-2xl border border-slate-800">
                ¿Necesitas ayuda? Escríbenos 💬
              </span>
            </a>
          </div>
        </Router>
        </CartProvider>
      </AuthProvider>

    </QueryClientProvider>
  );
}

export default App;
