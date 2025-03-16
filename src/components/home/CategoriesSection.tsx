import CategoryCard from "@/components/ui/CategoryCard";

const CategoriesSection = () => {
  return (
    <section className="py-20 bg-food-light/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold mb-4 animate-fade-in">
            Our Specialties
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg animate-fade-in animate-delay-200">
            Discover our collection of authentic Indian delicacies, from traditional snacks to fresh foods and more.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in animate-delay-300">
          <CategoryCard 
            title="Traditional Snacks"
            description="Authentic homemade snacks prepared with age-old family recipes."
            image="https://topikrqamdglxakppbyg.supabase.co/storage/v1/object/public/product-images//popular-indian-snacks-list.webp"
            link="/products?category=snacks"
            colorAccent="food-snack"
          />
          <CategoryCard 
            title="Fresh Foods"
            description="Freshly prepared foods delivered locally on the same day."
            image="https://images.unsplash.com/photo-1564093497595-593b96d80180?q=80&w=2743&auto=format&fit=crop"
            link="/products?category=fresh"
            colorAccent="food-fresh"
          />
          <CategoryCard 
            title="Veg Pickles"
            description="Traditional homemade vegetarian pickles."
            image="https://images.unsplash.com/photo-1564093497595-593b96d80180?q=80&w=2743&auto=format&fit=crop"
            link="/products?category=pickles-veg"
            colorAccent="green"
          />
          <CategoryCard 
            title="Non-Veg Pickles"
            description="Authentic non-vegetarian pickles."
            image="https://images.unsplash.com/photo-1564093497595-593b96d80180?q=80&w=2743&auto=format&fit=crop"
            link="/products?category=pickles-nonveg"
            colorAccent="red"
          />
          <CategoryCard 
            title="Sweets"
            description="Traditional Indian sweets and desserts."
            image="https://images.unsplash.com/photo-1564093497595-593b96d80180?q=80&w=2743&auto=format&fit=crop"
            link="/products?category=sweets"
            colorAccent="yellow"
          />
          <CategoryCard 
            title="Instant Pre-mix"
            description="Ready-to-cook instant mixes."
            image="https://images.unsplash.com/photo-1564093497595-593b96d80180?q=80&w=2743&auto=format&fit=crop"
            link="/products?category=instant-premix"
            colorAccent="blue"
          />
          <CategoryCard 
            title="Podi"
            description="Traditional spice powders and podis."
            image="https://images.unsplash.com/photo-1564093497595-593b96d80180?q=80&w=2743&auto=format&fit=crop"
            link="/products?category=podi"
            colorAccent="purple"
          />
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
