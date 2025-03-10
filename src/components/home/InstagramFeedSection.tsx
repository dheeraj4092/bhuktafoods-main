
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const InstagramFeedSection = () => {
  return (
    <section className="py-16 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl lg:text-4xl font-medium mb-4 animate-fade-in">Follow Us on Instagram</h2>
            <p className="text-muted-foreground max-w-2xl animate-fade-in animate-delay-200">
              See what our customers are sharing about their snackolicious experience.
            </p>
          </div>
          <Button asChild variant="outline" className="self-start md:self-auto animate-fade-in animate-delay-300">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              @snackolicious <ExternalLink size={16} className="ml-2" />
            </a>
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in animate-delay-400">
          <div className="aspect-square rounded-xl overflow-hidden image-hover">
            <img 
              src="https://images.unsplash.com/photo-1554502078-ef0fc409efce?q=80&w=3084&auto=format&fit=crop" 
              alt="Instagram post" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="aspect-square rounded-xl overflow-hidden image-hover">
            <img 
              src="https://images.unsplash.com/photo-1559181567-c3190ca9959b?q=80&w=3087&auto=format&fit=crop" 
              alt="Instagram post" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="aspect-square rounded-xl overflow-hidden image-hover">
            <img 
              src="https://images.unsplash.com/photo-1599785209707-a456fc1337bb?q=80&w=3086&auto=format&fit=crop" 
              alt="Instagram post" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="aspect-square rounded-xl overflow-hidden image-hover">
            <img 
              src="https://images.unsplash.com/photo-1610834572594-73b81165b5c2?q=80&w=3087&auto=format&fit=crop" 
              alt="Instagram post" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="aspect-square rounded-xl overflow-hidden image-hover">
            <img 
              src="https://images.unsplash.com/photo-1609167830220-7164aa360951?q=80&w=2940&auto=format&fit=crop" 
              alt="Instagram post" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="aspect-square rounded-xl overflow-hidden image-hover">
            <img 
              src="https://images.unsplash.com/photo-1528825871115-3581a5387919?q=80&w=2930&auto=format&fit=crop" 
              alt="Instagram post" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeedSection;
