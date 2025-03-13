const HowItWorksSection = () => {
  return (
    <section className="py-16 px-6 lg:px-10 bg-food-light">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-medium mb-4 animate-fade-in">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto animate-fade-in animate-delay-200">
            Simple steps to enjoy our delicious offerings, whether you're ordering for yourself or as a gift.
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-10 mt-14">
          <div className="text-center space-y-4 animate-fade-in animate-delay-300">
            <div className="w-16 h-16 bg-food-snack/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-food-snack text-2xl font-medium">1</span>
            </div>
            <h3 className="text-xl font-medium">Browse & Select</h3>
            <p className="text-muted-foreground">
              Choose from our wide range of traditional snacks and fresh foods.
            </p>
          </div>
          
          <div className="text-center space-y-4 animate-fade-in animate-delay-400">
            <div className="w-16 h-16 bg-food-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-food-accent text-2xl font-medium">2</span>
            </div>
            <h3 className="text-xl font-medium">Place Your Order</h3>
            <p className="text-muted-foreground">
              Create an account, add items to cart, and choose delivery options.
            </p>
          </div>
          
          <div className="text-center space-y-4 animate-fade-in animate-delay-500">
            <div className="w-16 h-16 bg-food-fresh/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-food-fresh text-2xl font-medium">3</span>
            </div>
            <h3 className="text-xl font-medium">Enjoy Delivery</h3>
            <p className="text-muted-foreground">
              Receive updates via WhatsApp and enjoy your delicious items.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
