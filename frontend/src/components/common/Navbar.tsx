import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation(); // ← Get current route

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // ============================================
  // Check if link is active
  // ============================================
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // ============================================
  // NavLink Component with active underline
  // ============================================
  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        className={`text-charcoal hover:text-royal-blue transition font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-magenta after:transition-all after:duration-300 ${
          active ? 'after:w-full text-royal-blue' : 'after:w-0 hover:after:w-full'
        }`}
      >
        {children}
      </Link>
    );
  };

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-sm shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo Section */}
            <Link to="/" className="flex items-center justify-center md:justify-start flex-1 md:flex-none" onClick={closeMobileMenu}>
              <div className="w-26 h-10 md:w-46 md:h-16 rounded-lg overflow-hidden">
                <img src="/images/Logo.png" alt="Infinity Fashion" className="w-full h-full object-cover" />
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/products">Products</NavLink>
              <NavLink to="/about">About Us</NavLink>
              <NavLink to="/track-order">Track Order</NavLink>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMobileMenu}
              className="md:hidden text-charcoal hover:text-royal-blue transition focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Side Drawer Menu */}
      <div 
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Overlay */}
        <div 
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMobileMenu}
        />
        
        {/* Drawer */}
        <div 
          className={`absolute top-0 right-0 h-full w-64 bg-white shadow-2xl transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <Link to="/" onClick={closeMobileMenu} className="flex items-center">
                <div className="w-26 h-10 rounded-lg overflow-hidden">
                  <img src="/images/Logo.png" alt="Infinity Fashion" className="w-full h-full object-cover" />
                </div>
              </Link>
              <button 
                onClick={closeMobileMenu}
                className="text-charcoal hover:text-royal-blue transition"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Navigation Links with active styles */}
          <div className="flex flex-col py-4">
            <Link 
              to="/" 
              onClick={closeMobileMenu} 
              className={`text-charcoal hover:text-royal-blue hover:bg-gradient-to-r hover:from-royal-blue/5 transition px-6 py-3 font-medium ${
                isActive('/') ? 'text-royal-blue bg-royal-blue/5 border-r-4 border-magenta' : ''
              }`}
            >
              Home
            </Link>
            <Link 
              to="/products" 
              onClick={closeMobileMenu} 
              className={`text-charcoal hover:text-royal-blue hover:bg-gradient-to-r hover:from-royal-blue/5 transition px-6 py-3 font-medium ${
                isActive('/products') ? 'text-royal-blue bg-royal-blue/5 border-r-4 border-magenta' : ''
              }`}
            >
              Products
            </Link>
            <Link 
              to="/about" 
              onClick={closeMobileMenu} 
              className={`text-charcoal hover:text-royal-blue hover:bg-gradient-to-r hover:from-royal-blue/5 transition px-6 py-3 font-medium ${
                isActive('/about') ? 'text-royal-blue bg-royal-blue/5 border-r-4 border-magenta' : ''
              }`}
            >
              About Us
            </Link>
            <Link 
              to="/track-order" 
              onClick={closeMobileMenu} 
              className={`text-charcoal hover:text-royal-blue hover:bg-gradient-to-r hover:from-royal-blue/5 transition px-6 py-3 font-medium ${
                isActive('/track-order') ? 'text-royal-blue bg-royal-blue/5 border-r-4 border-magenta' : ''
              }`}
            >
              Track Order
            </Link>
          </div>
          
          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">© 2024 Infinity Fashion</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;