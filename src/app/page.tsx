import CardSlider from "@/components/cardslider";
import Footer from "@/components/footer";
import Header from "@/components/header";
import PredictDemo from "@/components/predict_demo";

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen">
      {/* วิดีโอพื้นหลัง */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          className="fixed top-0 left-0 w-full h-full object-cover object-center blur-md brightness-50"
        >
          <source src="/shortvid/gradient_loop.mp4" type="video/mp4" />
        </video>
      </div>

      {/* เลเยอร์โปร่งใสสีขาว */}
      <div className="absolute inset-0 z-10 bg-black/30 backdrop-blur-md"></div>

      {/* main content */}
      <main className="relative z-20 flex flex-col flex-1">
        <Header />

        <div className="flex flex-col items-center justify-center px-8 mt-12">
          <h1 className="text-white text-4xl">NextWBC</h1>
          <p className="text-white text-lg text-center mt-4">
            High-accuracy white blood cell detection and classification powered by the latest Ultralytics YOLO model.
          </p>
          <CardSlider />
        </div>

        <div className="flex flex-col items-center justify-center px-8">
          <p className="text-white text-lg text-center mt-4">
            Interesting? Try a demo here...
          </p>
        </div>

        <PredictDemo />
        <div className="mb-4 mt-8">
          <p className="text-center"> If you like it you can try at Prediction Page</p>
        </div>
        <Footer />
      </main>
    </div>

  )
}

