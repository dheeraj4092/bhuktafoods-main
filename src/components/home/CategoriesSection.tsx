import { useState } from "react";
import CategoryCard from "@/components/ui/CategoryCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const categories = [
  {
    title: "Traditional Snacks",
    description: "Authentic homemade snacks prepared with age-old family recipes.",
    image: "https://topikrqamdglxakppbyg.supabase.co/storage/v1/object/public/product-images//popular-indian-snacks-list.webp",
    link: "/products?category=snacks",
    colorAccent: "food-snack"
  },
  {
    title: "Fresh Foods",
    description: "Freshly prepared foods delivered locally on the same day.",
    image: "https://images.unsplash.com/photo-1564093497595-593b96d80180?q=80&w=2743&auto=format&fit=crop",
    link: "/products?category=fresh",
    colorAccent: "food-fresh"
  },
  {
    title: "Veg Pickles",
    description: "Traditional homemade vegetarian pickles.",
    image: "https://images.unsplash.com/photo-1564093497595-593b96d80180?q=80&w=2743&auto=format&fit=crop",
    link: "/products?category=pickles-veg",
    colorAccent: "green"
  },
  {
    title: "Non-Veg Pickles",
    description: "Authentic non-vegetarian pickles.",
    image: "https://images.unsplash.com/photo-1564093497595-593b96d80180?q=80&w=2743&auto=format&fit=crop",
    link: "/products?category=pickles-nonveg",
    colorAccent: "red"
  },
  {
    title: "Sweets",
    description: "Traditional Indian sweets and desserts.",
    image: "https://images.unsplash.com/photo-1564093497595-593b96d80180?q=80&w=2743&auto=format&fit=crop",
    link: "/products?category=sweets",
    colorAccent: "yellow"
  },
  {
    title: "Instant Pre-mix",
    description: "Ready-to-cook instant mixes.",
    image: "https://images.unsplash.com/photo-1564093497595-593b96d80180?q=80&w=2743&auto=format&fit=crop",
    link: "/products?category=instant-premix",
    colorAccent: "blue"
  },
  {
    title: "Podi",
    description: "Traditional spice powders and podis.",
    image: "https://images.unsplash.com/photo-1564093497595-593b96d80180?q=80&w=2743&auto=format&fit=crop",
    link: "/products?category=podi",
    colorAccent: "purple"
  }
];

const CategoriesSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % categories.length);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + categories.length) % categories.length);
  };

  return (
    <section className="py-12 bg-food-light/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold mb-4 animate-fade-in">
            Our Specialties
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg animate-fade-in animate-delay-200">
            Discover our collection of authentic Indian delicacies, from traditional snacks to fresh foods and more.
          </p>
        </div>
        
        <div className="relative max-w-2xl mx-auto">
          <div className="animate-fade-in animate-delay-300">
            <CategoryCard {...categories[currentIndex]} />
          </div>
          
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={prevCard}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
              aria-label="Previous category"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="flex gap-2">
              {categories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-primary" : "bg-gray-300"
                  }`}
                  aria-label={`Go to category ${index + 1}`}
                />
              ))}
            </div>
            
            <button
              onClick={nextCard}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
              aria-label="Next category"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
