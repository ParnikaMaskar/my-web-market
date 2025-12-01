import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description?: string;
  category?: string;
  rating?: number;
  reviews?: number;
}

export const ProductCard = ({ id, name, price, originalPrice, image, description, category, rating = 0, reviews = 0 }: ProductCardProps) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    addToCart({ id, name, price, image });
    toast.success(`${name} added to cart`);
  };

  return (
    <Card className="gradient-card overflow-hidden transition-smooth hover:shadow-elegant group cursor-pointer">
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden bg-muted" onClick={() => navigate(`/product/${id}`)}>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-smooth group-hover:scale-105"
          />
          {originalPrice && (
            <Badge className="absolute top-3 right-3 bg-secondary text-secondary-foreground">
              Save {Math.round(((originalPrice - price) / originalPrice) * 100)}%
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 left-3 bg-background/80 backdrop-blur hover:bg-background"
            onClick={(e) => {
              e.stopPropagation();
              toast.success('Added to wishlist');
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4" onClick={() => navigate(`/product/${id}`)}>
          {category && (
            <Badge variant="outline" className="mb-2">{category}</Badge>
          )}
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{name}</h3>
          {description && (
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{description}</p>
          )}
          {rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(rating) ? 'fill-secondary text-secondary' : 'text-muted-foreground'
                  }`}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-1">
                ({reviews})
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-primary">₹{price.toFixed(2)}</p>
            {originalPrice && (
              <p className="text-sm text-muted-foreground line-through">
                ₹{originalPrice.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={handleAddToCart} className="w-full" size="lg">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};
