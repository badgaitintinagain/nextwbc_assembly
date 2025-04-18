import React from "react";
import Link from "next/link";
import Header from "@/components/header";
import CardSlider from "@/components/cardslider";
import Footer from "@/components/footer";
import PredictDemo from "@/components/predict_demo";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      {/* content ตรงกลาง */}
      <div className="flex flex-col items-center justify-center px-8 mt-12">
        <h1 className="text-black text-4xl">NextWBC</h1>
        <p className="text-black text-lg text-center mt-4">
          High-accuracy white blood cell detection and classification powered by the latest Ultralytics YOLO model.
        </p>
        <CardSlider />
      </div>

      <div className="flex flex-col items-center justify-center px-8">
        <p className="text-black text-lg text-center mt-4">
          Interesting? Try a demo here...
        </p>
      </div>

      <PredictDemo />

      <Footer />
    </main>
  );
}

