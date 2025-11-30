import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { getCurrentUser, logoutUser } from '@/utils/auth';

export const Navbar = () => {
  const { itemCount } = useCart();
  const user = getCurrentUser();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <ShoppingBag className="h-8 w-8" />
            ShopHub
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-4">

            {/* If NOT logged in */}
            {!user && (
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
            )}

            {/* If logged in as normal user */}
            {user && user.role === "user" && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  Hello, {user.name.split(" ")[0]}
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/profile")}
                >
                  <User className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* If logged in as admin */}
            {user && user.role === "admin" && (
              <Button variant="outline" onClick={() => navigate("/admin")}>
                Admin Panel
              </Button>
            )}

            {/* Cart Button */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
};
