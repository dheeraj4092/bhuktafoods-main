import { useState, useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { Filter, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingCart from "@/components/ui/FloatingCart";
import ProductCard from "@/components/ui/ProductCard";
import PincodeCheck from "@/components/ui/PincodeCheck";
import { cn } from "@/lib/utils";

const ProductsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get("category");
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    category: categoryParam || "all",
    availability: "all",
    sortBy: "newest"
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState<boolean | null>(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('Fetching products from API...');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        console.log('API Response data:', data);
        
        // Check if data is an array
        if (Array.isArray(data)) {
          console.log('Setting products array:', data);
          setProducts(data);
        } else if (data.products && Array.isArray(data.products)) {
          // Handle case where data has a products property
          console.log('Setting products from data.products:', data.products);
          setProducts(data.products);
        } else {
          console.warn('Invalid products data format:', data);
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Memoize filtered products
  const filteredProducts = useMemo(() => {
    console.log('Filtering products:', products);
    if (!products || !Array.isArray(products)) {
      console.warn('Products is not an array:', products);
      return [];
    }
    
    let filtered = [...products];
    console.log('Initial filtered products:', filtered);
    
    // Filter by category
    if (activeFilters.category !== "all") {
      filtered = filtered.filter(
        product => product.category === activeFilters.category
      );
      console.log('After category filter:', filtered);
    }
    
    // Filter by availability
    if (activeFilters.availability === "available") {
      filtered = filtered.filter(product => product.stock_quantity > 0);
    } else if (activeFilters.availability === "preorder") {
      filtered = filtered.filter(product => product.stock_quantity === 0);
    }
    console.log('After availability filter:', filtered);
    
    // Sort products
    if (activeFilters.sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (activeFilters.sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (activeFilters.sortBy === "newest") {
      filtered.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      });
    }
    console.log('Final filtered products:', filtered);
    
    return filtered;
  }, [products, activeFilters]);
  
  const updateFilter = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleDeliveryAvailable = () => {
    setIsDeliveryAvailable(true);
  };

  const handleDeliveryUnavailable = () => {
    setIsDeliveryAvailable(false);
  };

  const FilterSection = ({ isMobile = false }) => (
    <div className={cn("flex flex-col gap-6", isMobile ? "p-6" : "")}>
      <div>
        <h3 className="font-medium mb-4">Categories</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="all"
              checked={activeFilters.category === "all"}
              onCheckedChange={() => updateFilter("category", "all")}
            />
            <label htmlFor="all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              All Products
            </label>
          </div>
          {["snacks", "fresh", "pickles-veg", "pickles-nonveg", "sweets", "instant-premix", "podi"].map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={activeFilters.category === category}
                onCheckedChange={() => updateFilter("category", category)}
              />
              <label htmlFor={category} className="text-sm font-medium leading-none capitalize peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {category.replace("-", " ")}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-medium mb-4">Availability</h3>
        <div className="space-y-3">
          {["all", "available", "preorder"].map((availability) => (
            <div key={availability} className="flex items-center space-x-2">
              <Checkbox
                id={availability}
                checked={activeFilters.availability === availability}
                onCheckedChange={() => updateFilter("availability", availability)}
              />
              <label htmlFor={availability} className="text-sm font-medium leading-none capitalize peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {availability === "all" ? "Show All" : availability}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-medium mb-4">Sort By</h3>
        <div className="space-y-3">
          {[
            { value: "newest", label: "Newest First" },
            { value: "price-low", label: "Price: Low to High" },
            { value: "price-high", label: "Price: High to Low" }
          ].map(({ value, label }) => (
            <div key={value} className="flex items-center space-x-2">
              <Checkbox
                id={value}
                checked={activeFilters.sortBy === value}
                onCheckedChange={() => updateFilter("sortBy", value)}
              />
              <label htmlFor={value} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading products...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-8">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">Error loading products</div>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Our Products</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our wide range of high-quality products, carefully curated for your needs.
          </p>
        </div>

        {/* Filters and Products Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <FilterSection />
          </div>

          {/* Mobile Filters */}
          <div className="lg:hidden">
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <FilterSection isMobile />
              </SheetContent>
            </Sheet>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                  image={product.image}
                  image_url={product.image_url}
                  category={product.category}
                  isAvailable={product.stock_quantity > 0}
                  isPreOrder={product.stock_quantity === 0}
                  deliveryEstimate={product.delivery_estimate}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <FloatingCart />
      <PincodeCheck
        onDeliveryAvailable={handleDeliveryAvailable}
        onDeliveryUnavailable={handleDeliveryUnavailable}
      />
    </div>
  );
};

export default ProductsPage;
