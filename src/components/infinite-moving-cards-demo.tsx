"use client";

import React from "react";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

export default function InfiniteMovingCardsDemo() {
  return (
    <div className="h-[32rem] sm:h-[36rem] rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
      <InfiniteMovingCards
        items={testimonials}
        direction="right"
        speed="slow"
      />
    </div>
  );
}

const testimonials = [
  {
    quote:
      "The Karam Billalu are absolutely addictive! Perfectly crispy and packed with just the right amount of spice. They remind me of homemade snacks from my childhood.",
    name: "Kranthi Dev",
    title: "Regular Customer",
  },
  {
    quote:
      "Sakinalu from Bhukta Foods are as authentic as it gets! The crunch and subtle sesame flavor bring back nostalgic memories of festive celebrations.",
    name: "Mani Teja",
    title: "Regular Customer",
  },
  {
    quote: "Murukulu has always been my favorite, and their version is spot on! Super crunchy, lightly spiced, and just melts in the mouth. A must-try!",
    name: "Satish Chandra",
    title: "Regular Customer",
  },
  {
    quote:
      "Masala Kaju is my go-to snack now! The spice blend is absolutely perfect—not too overpowering, just the right kick of flavor. Great for tea-time munching.",
    name: "Dheeraj Kumar",
    title: "Hot Lover",
  },
  {
    quote:
      "I ordered these snacks for a family gathering, and everyone loved them! Fresh, crispy, and perfectly seasoned. Will definitely be ordering again.",
    name: "Sharath Chandra",
    title: "Regular Customer",
  },
]; 