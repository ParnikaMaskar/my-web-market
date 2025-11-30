import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '@/components/ProductCard';
import { Navbar } from '@/components/Navbar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { api } from "@/services/api";

const categories = ['All', 'Electronics', 'Audio', 'Computers', 'Accessories', 'Gaming', 'Other'];

export default function Products() {

  // GET all products via react-query
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: api.getProducts,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [showFilters, setShowFilters] = useState(false);

  // Filtering with useMemo (optimized)
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products;

    // search text filter (case-insensitive)
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((product: any) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // category filter (case-insensitive)
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (product: any) =>
          (product.category || "").toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // price range filter
    filtered = filtered.filter(
      (product: any) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    return filtered;

  }, [products, searchQuery, selectedCategory, priceRange]);

  // Reset filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setPriceRange([0, 100000]);
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
        
        {/* Search + Filters */}
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

            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Category badges */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer transition-smooth"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}

            {(searchQuery || selectedCategory !== "All" || priceRange[0] !== 0 || priceRange[1] !== 100000) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 gap-1">
                <X className="h-3 w-3" />
                Clear
              </Button>
            )}
          </div>

          {/* Price filter panel */}
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
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <Separator className="mb-6" />

        {/* Loading state */}
        {isLoading ? (
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

          // No result state
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">No products found</p>
            <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
          </div>

        ) : (

          // Final Product Grid
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
