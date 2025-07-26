import CardSlider from "@/components/cardslider";
import Footer from "@/components/footer";
import Header from "@/components/header";
import PredictDemo from "@/components/predict_demo";

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen w-full bg-black overflow-hidden">
      {/* Background video - full coverage */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          className="absolute top-0 left-0 w-full h-full object-cover blur-md brightness-50"
          style={{ transform: 'scale(1.1)' }} // Slight scale to ensure no gaps
        >
          <source src="/shortvid/gradient_loop.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 z-10 bg-black/30 backdrop-blur-md w-full h-full"></div>

      {/* main content */}
      <main className="relative z-20 flex flex-col flex-1 w-full">
        <Header />

        <div className="flex flex-col items-center justify-center px-4 sm:px-8 mt-28 md:mt-32">
          <h1 className="text-white text-3xl md:text-4xl text-center">NextWBC</h1>
          <p className="text-white text-base md:text-lg text-center mt-4 px-2 max-w-3xl">
            High-accuracy white blood cell detection of raptors, powered by the latest Ultralytics YOLO model.
          </p>
          <CardSlider />
        </div>


        <div className="px-4 w-full flex justify-center">
          <PredictDemo />
        </div>
        <div className="mb-4 mt-8 px-4 text-center">
          <p className="text-white text-sm md:text-base"> If you are interested in it, you can try at the Prediction Page</p>
        </div>
        <Footer />
      </main>
    </div>
  )
}

