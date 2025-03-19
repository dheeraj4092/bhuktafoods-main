
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
        
        
        
      </div>
    </section>
  );
};

export default InstagramFeedSection;
