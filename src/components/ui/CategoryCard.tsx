
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
        "group relative overflow-hidden rounded-3xl flex flex-col h-[400px]",
        "transition-all duration-500 transform hover:-translate-y-1",
        `hover:shadow-lg hover:shadow-${colorAccent}/10`
      )}
    >
      {/* Image with overlay gradient */}
      <div className="absolute inset-0 overflow-hidden">
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-secondary loading-shimmer" />
        )}
        <img
          src={image}
          alt={title}
          className={cn(
            "w-full h-full object-cover transition-transform duration-700 ease-out",
            "group-hover:scale-105",
            !isImageLoaded && "opacity-0",
            isImageLoaded && "opacity-100"
          )}
          onLoad={() => setIsImageLoaded(true)}
        />
        {/* Gradient overlay */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
          )}
        />
      </div>
      
      {/* Content */}
      <div className="relative mt-auto p-8 z-10 text-white">
        <h3 className={cn(
          "text-2xl md:text-3xl font-medium mb-2",
          `text-${colorAccent}`
        )}>
          {title}
        </h3>
        <p className="text-white/90 mb-6 max-w-xs">
          {description}
        </p>
        <div 
          className={cn(
            "inline-flex items-center text-sm font-medium transition-all duration-300",
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
