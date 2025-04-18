"use client"
import { useState, useEffect } from "react";

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
    <div className="flex flex-col items-center justify-center py-12 bg-gray-100 px-8">
      <div className="flex space-x-4">
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
