
const TestimonialsSection = () => {
  return (
    <section className="py-16 px-6 lg:px-10 bg-food-light">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl lg:text-4xl font-medium mb-4 animate-fade-in">What Our Customers Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto animate-fade-in animate-delay-200">
            Hear from people who enjoy our traditional snacks and fresh foods.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in animate-delay-300">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop" 
                  alt="Customer" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-medium">Kranthi Dev</h4>
                <p className="text-xs text-muted-foreground">Hyderabad</p>
              </div>
            </div>
            <p className="italic text-muted-foreground">
              "The Karam Billalu are absolutely addictive! Perfectly crispy and packed with just the right amount of spice. They remind me of homemade snacks from my childhood."
            </p>
            <div className="flex mt-4">
              <span className="text-food-snack">★★★★★</span>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2787&auto=format&fit=crop" 
                  alt="Customer" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-medium">Mani Teja</h4>
                <p className="text-xs text-muted-foreground">Mumbai</p>
              </div>
            </div>
            <p className="italic text-muted-foreground">
               "Sakinalu from Bhukta Foods are as authentic as it gets! The crunch and subtle sesame flavor bring back nostalgic memories of festive celebrations."
            </p>
            <div className="flex mt-4">
              <span className="text-food-fresh">★★★★★</span>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <img 
                  src="https://images.unsplash.com/photo-1619895862022-09114b41f16f?q=80&w=2787&auto=format&fit=crop" 
                  alt="Customer" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-medium">Satish Chandra</h4>
                <p className="text-xs text-muted-foreground">Hyderabad</p>
              </div>
            </div>
            <p className="italic text-muted-foreground">
              "Murukulu has always been my favorite, and their version is spot on! Super crunchy, lightly spiced, and just melts in the mouth. A must-try!"
            </p>
            <div className="flex mt-4">
              <span className="text-food-accent">★★★★★</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
