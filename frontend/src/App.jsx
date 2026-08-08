import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages imports
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';

// Admin imports
import AdminDashboard from './admin/AdminDashboard';
import CartDrawer from './components/CartDrawer';

// Helper component to enable useLocation context inside Router
const AppContent = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Global Slide-Over Basket Drawer */}
      <CartDrawer />

      {/* Show Navbar on public pages only */}
      {!isAdminPath && <Navbar />}

      {/* Main Content Area */}
      <main className="grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Admin Dashboard */}
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </main>

      {/* Show Footer on public pages only */}
      {!isAdminPath && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
