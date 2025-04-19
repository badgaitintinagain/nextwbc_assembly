"use client"
import Footer from "@/components/footer";
import Header from "@/components/header";
import { motion } from 'framer-motion';
import React, { useRef, useState } from "react";

interface ImageItem {
  file: File | null;
  previewUrl: string;
  fileName: string;
}
interface Detection {
  class: string;
  confidence: number;
}
interface PredictionResult {
  detections: Detection[];
  filename: string;
  annotated_image?: string;
  predictedImage: {
    previewUrl: string;
    fileName: string;
  };
  timestamp: string;
}

export default function Prediction() {
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [recentImages, setRecentImages] = useState<ImageItem[]>([]);
  const [detailResult, setDetailResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultsHistory, setResultsHistory] = useState<PredictionResult[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []); // allow any number for recent images
    Promise.all(files.map(file => new Promise<ImageItem>(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve({ file, previewUrl: reader.result as string, fileName: file.name });
      reader.readAsDataURL(file);
    }))).then(items => {
      setRecentImages(prev => [...items, ...prev]);
      // reset preview and clear selection
      setSelectedImages([]);
      setCurrentIndex(0);
    });
  };

  const handleImageToggle = (image: ImageItem) => {
    let updated: ImageItem[] = [];
    setSelectedImages(prev => {
      const exists = prev.find(x => x.fileName === image.fileName);
      if (exists) updated = prev.filter(x => x.fileName !== image.fileName);
      else if (prev.length < 10) updated = [...prev, image];
      else updated = prev;
      return updated;
    });
    if (updated.length > 0) setCurrentIndex(0);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePredict = async () => {
    if (selectedImages.length === 0) return;
    
    setIsLoading(true);
    
    try {
      for (const img of selectedImages) {
        const formData = new FormData();
        formData.append('file', img.file!);
        const response = await fetch('http://localhost:8000/predict/', { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Prediction failed');
        const data = await response.json();
        // build result
        const newResult = {
          ...data,
          predictedImage: { previewUrl: img.previewUrl, fileName: img.fileName },
          timestamp: new Date().toLocaleString()
        };
        setResultsHistory(prev => [newResult as PredictionResult, ...prev]);
      }
    
    } catch (error) {
      console.error('Error predicting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="px-4 py-2 mx-auto max-w-7xl h-[calc(100vh-130px)] overflow-hidden">
        <div className="bg-white rounded-xl shadow-md p-3 h-full flex flex-col">
          <div className="grid grid-cols-12 gap-3 h-full overflow-hidden">
            {/* Left Panel - Upload + Image List */}
            <div className="col-span-4 flex flex-col gap-3 h-full overflow-hidden">
              {/* Upload Image Section */}
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <h2 className="text-gray-800 text-base font-medium mb-2">Upload Image</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
                    onClick={handleUploadClick}
                  >
                    Upload
                  </button>
                  <div className="bg-white text-black text-sm px-3 py-2 rounded-lg border border-gray-200 flex-1 truncate">
                    {selectedImages.length > 0 ? `${selectedImages.length} selected` : 'No files selected'}
                  </div>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*" 
                    multiple
                    className="hidden" 
                  />
                </div>
              </div>
              
              {/* Image List Section - Scrollable */}
              <div className="border border-gray-200 rounded-lg p-3 flex-1 overflow-y-auto min-h-0">
                <h2 className="text-gray-800 text-base font-medium mb-2">Recent Images</h2>
                {recentImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {recentImages.map((img, i) => (
                      <div
                        key={i}
                        className={`border rounded-lg p-1 cursor-pointer transition hover:shadow ${
                          selectedImages.find(x => x.fileName === img.fileName)
                            ? 'ring-2 ring-blue-500'
                            : 'border-gray-200'
                        }`}
                        onClick={() => handleImageToggle(img)}
                      >
                        <img src={img.previewUrl} alt={`Image ${i}`} className="w-full aspect-square object-cover rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">No images uploaded yet</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Panel - Preview + Results */}
            <div className="col-span-8 flex flex-col gap-3 h-full overflow-hidden">
              {/* Image Preview + Prediction Controls */}
              <div className="border border-gray-200 rounded-lg p-2 flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-gray-800 text-sm font-medium">Preview & Prediction</h2>
                  <button 
                    className={`${isLoading ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'} text-white px-2 py-1 rounded-md text-xs`}
                    onClick={handlePredict}
                    disabled={isLoading || selectedImages.length === 0}
                  >
                    {isLoading ? 'Processing...' : 'Predict'}
                  </button>
                </div>
                
                {/* Image preview */}
                <div className="flex-1 flex flex-col p-2 relative overflow-hidden">
                  {/* Thumbnail selector row (max 10 selectable) */}
                  {selectedImages.length > 0 && (
                    <div className="flex gap-1 overflow-x-auto p-1 border-b border-gray-200 h-12">
                      {selectedImages.map((img, idx) => (
                        <img
                          key={idx}
                          src={img.previewUrl}
                          alt={`Thumb ${idx}`}
                          onClick={() => setCurrentIndex(idx)}
                          className={`h-10 w-10 object-cover cursor-pointer rounded ${currentIndex === idx ? 'ring-2 ring-blue-500' : 'border'}`}
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
                    <img
                      src={selectedImages[currentIndex]?.previewUrl || '/images/imagen_pic.jpg'}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                    {/* Results overlay */}
                    {resultsHistory.length > 0 && selectedImages[currentIndex]?.fileName === resultsHistory[0].filename && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-1 backdrop-blur-sm">
                        <p className="text-xs">Detected: {resultsHistory[0].detections.map((d: Detection) => `${d.class} (${(d.confidence * 100).toFixed(1)}%)`).join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Previous Prediction Results - Grid Cards */}
              <div className="border border-gray-200 rounded-lg p-3 flex-none h-48 overflow-y-auto">
                <h2 className="text-gray-800 text-base font-medium mb-2">Prediction Results</h2>
                {resultsHistory.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {resultsHistory.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 bg-gray-50 p-2 rounded-lg cursor-pointer hover:bg-gray-100 text-black"
                        onClick={() => setDetailResult(result)}
                      >
                        <div className="w-16 h-16 flex-shrink-0">
                          <img 
                            src={result.predictedImage.previewUrl} 
                            alt="Prediction"
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{result.predictedImage.fileName}</p>
                          <div className="flex flex-wrap gap-1 my-1">
                            {result.detections.map((d: Detection, i: number) => (
                              <span key={`${d.class}-${i}`} className="inline-block bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs font-medium">
                                {d.class} ({(d.confidence * 100).toFixed(1)}%)
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-600">Predicted at: {result.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">No previous predictions</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal for detail result */}
      {detailResult && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur flex items-center justify-center" onClick={() => setDetailResult(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded-2xl text-black shadow-lg max-w-lg"
          >
            <img src={detailResult.annotated_image || detailResult.predictedImage.previewUrl} alt="Detail" className="w-full mb-4" />
            <h3 className="font-medium mb-2">{detailResult.predictedImage.fileName}</h3>
            <div className="flex flex-wrap gap-1 mb-2">
              {detailResult.detections.map((d, i) => (
                <span key={`${d.class}-${i}`} className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs">
                  {d.class} ({(d.confidence * 100).toFixed(1)}%)
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500">Predicted at: {detailResult.timestamp}</p>
          </motion.div>
        </div>
      )}
      <Footer />
    </>
  );
}