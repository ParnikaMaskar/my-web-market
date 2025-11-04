import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Navbar } from '@/components/Navbar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const categories = ['All', 'Electronics', 'Audio', 'Computers', 'Accessories', 'Gaming'];

const mockProducts = [
  {
    id: 1,
    name: 'Premium Wireless Headphones',
    price: 299.99,
    originalPrice: 399.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    description: 'High-quality wireless headphones with noise cancellation',
    category: 'Audio',
    rating: 4.5,
    reviews: 1234,
  },
  {
    id: 2,
    name: 'Smart Watch Pro',
    price: 399.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    description: 'Advanced fitness tracking and notifications',
    category: 'Electronics',
    rating: 4.7,
    reviews: 892,
  },
  {
    id: 3,
    name: 'Laptop Stand',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
    description: 'Ergonomic aluminum laptop stand',
    category: 'Accessories',
    rating: 4.3,
    reviews: 456,
  },
  {
    id: 4,
    name: 'Mechanical Keyboard',
    price: 149.99,
    originalPrice: 199.99,
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500',
    description: 'RGB backlit mechanical gaming keyboard',
    category: 'Gaming',
    rating: 4.8,
    reviews: 2103,
  },
  {
    id: 5,
    name: 'Wireless Mouse',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500',
    description: 'Precision wireless mouse with ergonomic design',
    category: 'Computers',
    rating: 4.4,
    reviews: 678,
  },
  {
    id: 6,
    name: 'USB-C Hub',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500',
    description: 'Multi-port USB-C hub with HDMI and card reader',
    category: 'Accessories',
    rating: 4.2,
    reviews: 334,
  },
  {
    id: 7,
    name: 'Gaming Headset',
    price: 179.99,
    image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=500',
    description: '7.1 surround sound gaming headset with RGB',
    category: 'Gaming',
    rating: 4.6,
    reviews: 1567,
  },
  {
    id: 8,
    name: 'Bluetooth Speaker',
    price: 129.99,
    originalPrice: 179.99,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
    description: 'Portable waterproof bluetooth speaker',
    category: 'Audio',
    rating: 4.5,
    reviews: 891,
  },
];

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Replace with: api.getProducts()
    setTimeout(() => {
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    let filtered = products;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter(
      product => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, priceRange, products]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setPriceRange([0, 500]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="gradient-hero text-primary-foreground py-12 mb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-3">Shop the Best Deals</h1>
          <p className="text-lg opacity-90">Discover amazing products at unbeatable prices</p>
        </div>
      </div>

      <main className="container mx-auto px-4 pb-12">
        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer transition-smooth"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
            {(searchQuery || selectedCategory !== 'All') && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 gap-1">
                <X className="h-3 w-3" />
                Clear
              </Button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Price Range</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-24"
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-24"
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <Separator className="mb-6" />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">No products found</p>
            <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
