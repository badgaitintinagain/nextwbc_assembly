"use client"
import { useEffect, useState, useCallback, useMemo } from "react";

export default function CardSlider() {
  const [current, setCurrent] = useState(0);

  // Memoize cards data to prevent recreating on every render
  const cards = useMemo(() => [
    {
      id: 0,
      title: "Easy",
      image: "/images/card1.png",
      description: "Just upload an image, then press predict *kapow!*"
    },
    {
      id: 1,
      title: "Efficient",
      image: "/images/card2.jpg",
      description: "We use a small-sized YOLO model, tuned to be fast and accurate with a small dataset"
    },
    {
      id: 2,
      title: "Elastic",
      image: "/images/card3.png",
      description: "I... I forgot - Never mind, we have a history of old predictions stored for up to 150 hours"
    },
  ], []);

  // Use useCallback for click handler
  const handleDotClick = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  // Use useCallback for image error handler
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log(`Failed to load image: ${e.currentTarget.src}`);
    e.currentTarget.src = '/images/placeholder.png'; // fallback image
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % cards.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [cards.length]);

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 md:px-8 w-full">
      {/* For mobile: Stack vertically and show only the current card */}
      <div className="md:hidden w-full">
        <div
          className="p-4 w-full rounded-xl flex flex-col items-center text-center text-black bg-white shadow-lg border-4 border-blue-500"
        >
          <h2 className="text-xl font-semibold mb-3">{cards[current].title}</h2>
          <img 
            src={cards[current].image} 
            alt={cards[current].title} 
            className="w-32 h-32 object-cover rounded-md mb-3"
            onError={handleImageError}
          />
          <p className="text-sm">{cards[current].description}</p>
        </div>
        <div className="flex justify-center mt-3 space-x-2">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full ${current === index ? 'bg-blue-500' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
      
      {/* For tablet and above: Show all cards side by side */}
      <div className="hidden md:flex space-x-4">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`p-4 w-60 rounded-xl flex flex-col items-center text-center text-black transition-all duration-500 ${
              current === index
                ? "bg-white scale-105 border-4 border-blue-500 shadow-lg"
                : "bg-white opacity-70"
            }`}
          >
            <h2 className="text-xl font-semibold mb-3">{card.title}</h2>
            <img 
              src={card.image} 
              alt={card.title} 
              className="w-32 h-32 object-cover rounded-md mb-3"
              onError={handleImageError}
            />
            <p className="text-sm">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
