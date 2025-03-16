import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface CategoryCardProps {
  title: string;
  description: string;
  image: string;
  link: string;
  colorAccent: string;
}

const CategoryCard = ({
  title,
  description,
  image,
  link,
  colorAccent
}: CategoryCardProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <Link
      to={link}
      className={cn(
        "group relative overflow-hidden rounded-2xl flex flex-col",
        "bg-white border border-border/50",
        "transition-all duration-300 hover:shadow-lg hover:border-transparent",
        "transform hover:-translate-y-1"
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-secondary/20 loading-shimmer" />
        )}
        <img
          src={image}
          alt={title}
          className={cn(
            "w-full h-full object-cover transition-transform duration-500",
            "group-hover:scale-105",
            !isImageLoaded && "opacity-0",
            isImageLoaded && "opacity-100"
          )}
          onLoad={() => setIsImageLoaded(true)}
        />
      </div>
      
      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className={cn(
          "text-xl font-semibold mb-2",
          `text-${colorAccent}`
        )}>
          {title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {description}
        </p>
        <div 
          className={cn(
            "mt-auto inline-flex items-center text-sm font-medium",
            "transition-all duration-300",
            `text-${colorAccent} group-hover:translate-x-1`
          )}
        >
          Explore <ChevronRight size={16} className="ml-1" />
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
