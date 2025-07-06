"use client"
import Footer from "@/components/footer";
import Header from "@/components/header";
import { API_ENDPOINTS, getBackendUrl } from "@/lib/config";
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

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
      const formData = new FormData();
      
      // เพิ่มรูปภาพลงใน formData
      for (let i = 0; i < selectedImages.length; i++) {
        formData.append('files', selectedImages[i].file!);
      }
      
      // ประมวลผลรูปภาพแต่ละรูป และเก็บผลลัพธ์
      const processingResults = [];
      
      for (let imgIndex = 0; imgIndex < selectedImages.length; imgIndex++) {
        const img = selectedImages[imgIndex];
        const imgFormData = new FormData();
        imgFormData.append('file', img.file!);
        
        const response = await fetch(`${getBackendUrl()}${API_ENDPOINTS.PREDICT}`, { 
          method: 'POST', 
          body: imgFormData 
        });
        
        if (!response.ok) throw new Error('Prediction failed');
        
        const data = await response.json();
        
        // ถ้ามีรูปภาพที่มีการ annotate แล้ว ให้แปลงจาก base64 เป็น Blob และเพิ่มลงใน formData
        if (data.annotated_image) {
          const base64Response = await fetch(data.annotated_image);
          const blob = await base64Response.blob();
          formData.append(`annotated_${imgIndex}`, blob);
        }
        
        // เก็บผลลัพธ์เพื่อแสดงผลทันที
        processingResults.push({
          ...data,
          imageIndex: imgIndex,
          predictedImage: { 
            previewUrl: URL.createObjectURL(img.file!), 
            fileName: img.fileName 
          },
          timestamp: new Date().toLocaleString()
        });
      }
      
      // เพิ่มข้อมูล detections ลงใน formData
      const allDetections = processingResults.flatMap((result, imgIndex) => 
        result.detections.map(detection => ({
          ...detection,
          imageIndex: imgIndex
        }))
      );
      formData.append('detections', JSON.stringify(allDetections));
      
      // บันทึกลงฐานข้อมูล
      const saveResponse = await fetch('/api/predictions', {
        method: 'POST',
        body: formData
      });
      
      if (!saveResponse.ok) {
        throw new Error('Failed to save prediction data');
      }
      
      // อัปเดตประวัติผลลัพธ์
      setResultsHistory(prev => [...processingResults, ...prev]);
      
    } catch (error) {
      console.error('Error predicting:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleViewVault = () => {
    router.push('/vault');
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Background video */}
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

      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 z-10 bg-black/30 backdrop-blur-md"></div>

      {/* main content */}
      <main className="relative z-20 flex flex-col flex-1">
        <Header />
        <div className="px-4 py-4 md:py-6 mx-auto max-w-7xl flex-1 overflow-hidden flex flex-col">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 md:p-5 flex-1 flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-800">Image Prediction</h1>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors"
                onClick={handleViewVault}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                View Vault
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 flex-1 min-h-0">
              {/* Left Panel - Upload + Image List */}
              <div className="md:col-span-4 flex flex-col gap-4 h-full overflow-hidden">
                {/* Upload Image Section */}
                <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                  <h2 className="text-gray-800 text-base font-medium mb-3">Upload Images</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      onClick={handleUploadClick}
                    >
                      Select Files
                    </button>
                    <div className="bg-gray-50 text-gray-700 text-sm px-3 py-2 rounded-lg border border-gray-200 flex-1 truncate">
                      {selectedImages.length > 0 ? `${selectedImages.length} image${selectedImages.length !== 1 ? 's' : ''} selected` : 'No files selected'}
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
                <div className="border border-gray-200 rounded-lg bg-white shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-gray-800 text-base font-medium">Available Images</h2>
                    <p className="text-xs text-gray-500 mt-1">Select up to 10 images for prediction</p>
                  </div>
                  
                  <div className="p-4 flex-1 overflow-y-auto min-h-0">
                    {recentImages.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {recentImages.map((img, i) => (
                          <div
                            key={i}
                            className={`border rounded-lg overflow-hidden cursor-pointer transition hover:shadow-md ${
                              selectedImages.find(x => x.fileName === img.fileName)
                                ? 'ring-2 ring-blue-500 shadow-sm border-transparent'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleImageToggle(img)}
                          >
                            <div className="aspect-square bg-gray-100 overflow-hidden">
                              <img src={img.previewUrl} alt={`Image ${i}`} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-2 bg-white">
                              <p className="text-xs truncate text-gray-700">{img.fileName}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-2 bg-gray-50 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-500">No images uploaded yet</p>
                        <button 
                          onClick={handleUploadClick}
                          className="text-blue-500 text-xs border border-blue-500 px-2 py-1 rounded-md hover:bg-blue-50"
                        >
                          Upload Images
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right Panel - Preview + Results */}
              <div className="md:col-span-8 flex flex-col gap-4 h-full overflow-hidden">
                {/* Image Preview + Prediction Controls */}
                <div className="border border-gray-200 rounded-lg bg-white shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-gray-800 text-base font-medium">Preview & Prediction</h2>
                    <button 
                      className={`${
                        isLoading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : selectedImages.length === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                      } px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2`}
                      onClick={handlePredict}
                      disabled={isLoading || selectedImages.length === 0}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Run Prediction
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Image preview container */}
                  <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    {/* Thumbnail selector row (max 10 selectable) */}
                    {selectedImages.length > 0 && (
                      <div className="flex gap-1 overflow-x-auto p-2 border-b border-gray-200">
                        {selectedImages.map((img, idx) => (
                          <div 
                            key={idx}
                            className={`h-16 w-16 flex-shrink-0 rounded overflow-hidden cursor-pointer ${
                              currentIndex === idx ? 'ring-2 ring-blue-500' : 'border border-gray-200'
                            }`}
                            onClick={() => setCurrentIndex(idx)}
                          >
                            <img
                              src={img.previewUrl}
                              alt={`Thumb ${idx}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Main preview area */}
                    <div className="flex-1 flex items-center justify-center p-4 overflow-hidden bg-gray-50">
                      {selectedImages.length > 0 ? (
                        <div className="relative max-h-full max-w-full">
                          <img
                            src={selectedImages[currentIndex]?.previewUrl}
                            alt="Preview"
                            className="max-h-[50vh] w-auto object-contain rounded shadow-md"
                          />
                          {/* Results overlay */}
                          {resultsHistory.length > 0 && selectedImages[currentIndex]?.fileName === resultsHistory[0].filename && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white p-2 backdrop-blur-sm">
                              <p className="text-xs">
                                Detected: {resultsHistory[0].detections.map((d: Detection) => (
                                  <span key={d.class} className="inline-block bg-blue-500/30 text-white rounded px-1.5 py-0.5 text-xs m-0.5">
                                    {d.class} ({(d.confidence * 100).toFixed(1)}%)
                                  </span>
                                ))}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8 px-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm font-medium">No image selected</p>
                          <p className="text-xs mt-1">Select an image from the left panel to preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Previous Prediction Results */}
                <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-gray-800 text-base font-medium">Recent Predictions</h2>
                  </div>
                  
                  <div className="p-4 overflow-y-auto" style={{ maxHeight: '16rem' }}>
                    {resultsHistory.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {resultsHistory.map((result, index) => (
                          <div
                            key={index}
                            className="flex bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
                            onClick={() => setDetailResult(result)}
                          >
                            <div className="w-20 h-20 flex-shrink-0 bg-gray-200">
                              <img 
                                src={result.annotated_image || result.predictedImage.previewUrl} 
                                alt="Prediction"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 p-3 min-w-0">
                              <p className="font-medium text-sm text-gray-800 truncate">{result.predictedImage.fileName}</p>
                              <div className="flex flex-wrap gap-1 my-1">
                                {result.detections.length > 0 ? (
                                  result.detections.slice(0, 3).map((d: Detection, i: number) => (
                                    <span key={`${d.class}-${i}`} className="inline-block bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs font-medium">
                                      {d.class} ({(d.confidence * 100).toFixed(1)}%)
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-gray-500">No detections</span>
                                )}
                                {result.detections.length > 3 && (
                                  <span className="inline-block bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">
                                    +{result.detections.length - 3} more
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{result.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-sm text-gray-500">No prediction history yet</p>
                        <p className="text-xs text-gray-400">Results will appear here after prediction</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal for detail result */}
        {detailResult && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDetailResult(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-5 rounded-2xl text-black shadow-xl max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative rounded-lg overflow-hidden mb-4 border border-gray-200">
                <img src={detailResult.annotated_image || detailResult.predictedImage.previewUrl} alt="Detail" className="w-full" />
              </div>
              <h3 className="font-medium text-lg mb-3">{detailResult.predictedImage.fileName}</h3>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {detailResult.detections.length > 0 ? (
                  detailResult.detections.map((d, i) => (
                    <span key={`${d.class}-${i}`} className="bg-blue-100 text-blue-800 rounded-full px-2.5 py-1 text-xs font-medium">
                      {d.class} ({(d.confidence * 100).toFixed(1)}%)
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No detections found</span>
                )}
              </div>
              <div className="border-t border-gray-200 pt-3 mt-2">
                <p className="text-xs text-gray-500">Predicted at: {detailResult.timestamp}</p>
              </div>
              <button
                className="mt-5 w-full bg-gray-800 hover:bg-gray-900 text-white py-2.5 rounded-lg font-medium transition-colors"
                onClick={() => setDetailResult(null)}
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
        <Footer />
      </main>
    </div>
  );
}