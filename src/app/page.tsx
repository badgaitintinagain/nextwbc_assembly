import React from "react";
import Link from "next/link";
import Header from "@/components/header";
import CardSlider from "@/components/cardslider";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      {/* content ตรงกลาง */}
      <div className="flex flex-col items-center justify-center px-8 mt-12 flex-grow">
        <h1 className="text-black text-4xl">NextWBC</h1>
        <p className="text-black text-lg text-center mt-4">
          High-accuracy white blood cell detection and classification powered by the latest Ultralytics YOLO model.
        </p>
        <CardSlider />
      </div>
      <div className="flex flex-col items-center justify-center px-8 flex-grow">
        <p className="text-black text-lg text-center mt-4">
          Interesting? then Explore it!
        </p>

        <Link href="/#">
          <button className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-xl text-lg hover:bg-blue-700 transition">
            Prediction
          </button>
        </Link>
      </div>

      <Footer />
    </main>
  );
}
