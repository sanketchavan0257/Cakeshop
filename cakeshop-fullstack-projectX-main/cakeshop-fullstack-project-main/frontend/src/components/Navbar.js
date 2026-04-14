import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ShoppingCart, User, Heart, Package, Moon, Sun, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from './ui/button';
import MobileSidebar from './MobileSidebar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav
      data-testid="main-navbar"
      className="sticky top-0 z-50 backdrop-blur-xl bg-[#FAFAF7]/80 dark:bg-[#2C1E16]/80 border-b border-[rgba(44,30,22,0.15)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile Sidebar + Logo */}
          <div className="flex items-center gap-4">
            <MobileSidebar />
            <Link
              to="/"
              data-testid="logo-link"
              className="text-2xl font-bold text-[#2C1E16] dark:text-[#FAFAF7]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              CakeCraft
            </Link>
          </div>

          {/* Desktop Navigation - Hidden on Mobile */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="theme-toggle-button"
              className="hover:bg-[#D0B8A8]/20"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {user ? (
              <>
                <Link to="/cart" data-testid="cart-link">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-[#D0B8A8]/20"
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </Link>

                <Link to="/favorites" data-testid="favorites-link">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-[#D0B8A8]/20"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>

                <Link to="/orders" data-testid="orders-link">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-[#D0B8A8]/20"
                  >
                    <Package className="h-5 w-5" />
                  </Button>
                </Link>

                {user.role === 'admin' && (
                  <Link to="/admin" data-testid="admin-link">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-[#D0B8A8]/20"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                    </Button>
                  </Link>
                )}

                <Link to="/dashboard" data-testid="dashboard-link">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-[#D0B8A8]/20"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  data-testid="logout-button"
                  className="hover:bg-[#E07A5F]/20"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" data-testid="login-link">
                  <Button
                    variant="ghost"
                    className="text-sm uppercase tracking-wide hover:bg-[#D0B8A8]/20"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register" data-testid="register-link">
                  <Button
                    className="text-sm uppercase tracking-wide bg-[#D0B8A8] hover:bg-[#B89B88] text-white"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
