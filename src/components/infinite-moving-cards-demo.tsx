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
      "The traditional snacks from Bhukta Foods are absolutely delicious! The quality and authenticity of flavors bring back childhood memories. Their packaging is also very elegant and keeps the snacks fresh.",
    name: "Priya Sharma",
    title: "Regular Customer",
  },
  {
    quote:
      "I love their fresh food section. The daily prepared meals are healthy, nutritious, and taste amazing. The subscription service is very convenient for working professionals like me.",
    name: "Rahul Verma",
    title: "Subscription Member",
  },
  {
    quote: "Their pickles are simply outstanding! The variety of both veg and non-veg pickles is impressive. The authentic recipes make them stand out.",
    name: "Anjali Patel",
    title: "Food Enthusiast",
  },
  {
    quote:
      "The sweets collection is divine! Each piece is crafted with perfection. Their quality control is excellent, and the prices are very reasonable for the quality offered.",
    name: "Amit Kumar",
    title: "Sweet Lover",
  },
  {
    quote:
      "The instant pre-mix products are a lifesaver! They make cooking traditional dishes so much easier without compromising on taste. The instructions are clear and easy to follow.",
    name: "Neha Singh",
    title: "Home Chef",
  },
]; 