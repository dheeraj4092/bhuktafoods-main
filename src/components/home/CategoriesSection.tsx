
import CategoryCard from "@/components/ui/CategoryCard";

const CategoriesSection = () => {
  return (
    <section className="py-16 px-6 lg:px-10 bg-food-light">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-medium mb-4 animate-fade-in">Our Specialties</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto animate-fade-in animate-delay-200">
            Choose from our traditional homemade snacks that ship nationwide, or freshly prepared local delights for same-day delivery.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in animate-delay-300">
          <CategoryCard 
            title="Traditional Snacks"
            description="Authentic homemade snacks prepared with age-old family recipes, available for nationwide and international shipping."
            image="https://topikrqamdglxakppbyg.supabase.co/storage/v1/object/public/product-images//popular-indian-snacks-list.webp"
            link="/products?category=snacks"
            colorAccent="food-snack"
          />
          <CategoryCard 
            title="Fresh Foods"
            description="Freshly prepared fruit bowls, smoothies, and healthy meals delivered locally on the same day."
            image="https://images.unsplash.com/photo-1564093497595-593b96d80180?q=80&w=2743&auto=format&fit=crop"
            link="/products?category=fresh"
            colorAccent="food-fresh"
          />
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
