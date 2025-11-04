import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { Star, ShoppingCart, Heart, ArrowLeft, Truck, Shield, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock product data - will be replaced with API call
const mockProducts = [
  {
    id: 1,
    name: 'Premium Wireless Headphones',
    price: 299.99,
    originalPrice: 399.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
      'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800',
    ],
    description: 'Experience premium sound quality with our wireless headphones featuring advanced noise cancellation technology.',
    category: 'Electronics',
    rating: 4.5,
    reviews: 1234,
    inStock: true,
    features: [
      'Active Noise Cancellation',
      '30-hour battery life',
      'Premium leather cushions',
      'Bluetooth 5.0',
      'Built-in microphone',
    ],
    specifications: {
      'Brand': 'AudioPro',
      'Model': 'AP-300X',
      'Weight': '250g',
      'Connectivity': 'Bluetooth 5.0',
      'Battery Life': '30 hours',
      'Charging Time': '2 hours',
    },
  },
  // Add more mock products...
];

const mockReviews = [
  {
    id: 1,
    user: 'John D.',
    rating: 5,
    date: '2024-01-15',
    comment: 'Excellent sound quality! Best headphones I\'ve ever owned.',
    verified: true,
  },
  {
    id: 2,
    user: 'Sarah M.',
    rating: 4,
    date: '2024-01-10',
    comment: 'Great product, very comfortable for long listening sessions.',
    verified: true,
  },
  {
    id: 3,
    user: 'Mike R.',
    rating: 5,
    date: '2024-01-05',
    comment: 'Amazing noise cancellation. Perfect for travel!',
    verified: true,
  },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with: api.getProduct(id)
    setTimeout(() => {
      const found = mockProducts.find(p => p.id === Number(id));
      setProduct(found);
      setLoading(false);
    }, 300);
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      toast.success(`${quantity} ${product.name}(s) added to cart`);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-square bg-muted rounded"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-muted rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="h-24 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <Link to="/">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <img
                src={product.images?.[selectedImage] || product.image}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
            </Card>
            <div className="grid grid-cols-4 gap-2">
              {(product.images || [product.image]).map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-smooth ${
                    selectedImage === idx ? 'border-primary' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-secondary text-secondary'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-muted-foreground">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-2xl text-muted-foreground line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                    <span className="text-lg font-semibold text-secondary">
                      Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  </>
                )}
              </div>
              <p className={`text-sm font-medium ${product.inStock ? 'text-primary' : 'text-destructive'}`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {product.features && (
              <div>
                <h3 className="font-semibold mb-2">Key Features</h3>
                <ul className="space-y-1">
                  {product.features.map((feature: string, idx: number) => (
                    <li key={idx} className="text-muted-foreground flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-muted transition-smooth"
                >
                  -
                </button>
                <span className="px-4 py-2 border-x border-border">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-muted transition-smooth"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleBuyNow} size="lg" className="flex-1">
                Buy Now
              </Button>
              <Button onClick={handleAddToCart} variant="secondary" size="lg" className="flex-1">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col items-center text-center p-3 bg-muted rounded-lg">
                <Truck className="h-6 w-6 mb-2 text-primary" />
                <span className="text-sm font-medium">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-muted rounded-lg">
                <Shield className="h-6 w-6 mb-2 text-primary" />
                <span className="text-sm font-medium">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-muted rounded-lg">
                <RefreshCw className="h-6 w-6 mb-2 text-primary" />
                <span className="text-sm font-medium">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Details and Reviews */}
        <Tabs defaultValue="specifications" className="mb-12">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({mockReviews.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="specifications" className="mt-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Technical Specifications</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex border-b border-border pb-3">
                    <span className="font-medium w-1/2">{key}</span>
                    <span className="text-muted-foreground">{value as string}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-4">
              {mockReviews.map((review) => (
                <Card key={review.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{review.user}</span>
                        {review.verified && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'fill-secondary text-secondary' : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
