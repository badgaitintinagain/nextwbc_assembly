"use client"
import { useEffect, useState } from "react";

export default function CardSlider() {
  const [current, setCurrent] = useState(0);

  const cards = [
    {
      id: 0,
      title: "Easy",
      image: "/images/imagen_pic.jpg",
      description: "Just upload an images then press predict *kapaw* "
    },
    {
      id: 1,
      title: "Efficient",
      image: "/images/imagen_pic.jpg",
      description: "we use small size of YOLO but tuning it to be fast and accurate by small dataset"
    },
    {
      id: 2,
      title: "Elastic",
      image: "/images/imagen_pic.jpg",
      description: "I..i forgot - Nevermind, we have history of old prediction. stored up to 150 Hours"
    },
  ];

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
          className="p-4 w-full rounded-2xl flex flex-col items-center text-center text-black bg-white shadow-lg border-4 border-blue-500"
        >
          <h2 className="text-xl font-semibold mb-2">{cards[current].title}</h2>
          <img src={cards[current].image} alt={cards[current].title} className="w-24 h-24 object-cover rounded-lg mb-2" />
          <p className="text-sm">{cards[current].description}</p>
        </div>
        <div className="flex justify-center mt-3 space-x-2">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
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
            className={`p-4 w-60 rounded-2xl flex flex-col items-center text-center text-black transition-all duration-500 ${
              current === index
                ? "bg-white scale-105 border-4 border-blue-500 shadow-lg"
                : "bg-white opacity-70"
            }`}
          >
            <h2 className="text-xl font-semibold mb-2">{card.title}</h2>
            <img src={card.image} alt={card.title} className="w-24 h-24 object-cover rounded-lg mb-2" />
            <p className="text-sm">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
