"use client"
import Footer from "@/components/footer";
import Header from "@/components/header";
import React, { useRef, useState } from "react";

interface ImageItem {
  file: File | null;
  previewUrl: string;
  fileName: string;
}

export default function Prediction() {
  const [selectedImage, setSelectedImage] = useState<ImageItem>({
    file: null,
    previewUrl: "/images/imagen_pic.jpg",
    fileName: "No file selected"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resultsHistory, setResultsHistory] = useState<{
    detections: any[];
    filename: string;
    annotated_image?: string;
    predictedImage: {
      previewUrl: string;
      fileName: string;
    };
    timestamp: string;
  }[]>([]);
  const [recentImages, setRecentImages] = useState<ImageItem[]>(
    Array(5).fill({
      file: null, 
      previewUrl: "/images/imagen_pic.jpg",
      fileName: "Default image"
    })
  );
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImageItem: ImageItem = {
          file: selectedFile,
          previewUrl: reader.result as string,
          fileName: selectedFile.name
        };
        
        // Set as selected image
        setSelectedImage(newImageItem);
        
        // Add to recent images (removing oldest if already 5)
        setRecentImages(prev => {
          const filteredPrev = prev.filter(item => item.file !== null);
          return [newImageItem, ...filteredPrev.slice(0, 4)];
        });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleImageSelect = (image: ImageItem) => {
    // Only allow selecting real uploaded images
    if (image.file !== null) {
      setSelectedImage(image);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePredict = async () => {
    if (!selectedImage.file) return;
    
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedImage.file);
      
      const response = await fetch('http://localhost:8000/predict/', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Prediction failed');
      }
      
      const data = await response.json();
      // Create a new result with timestamp
      const newResult = {
        ...data,
        predictedImage: {
          previewUrl: selectedImage.previewUrl,
          fileName: selectedImage.fileName
        },
        timestamp: new Date().toLocaleString()
      };
      
      // Add to history (newest first)
      setResultsHistory(prev => [newResult, ...prev]);
      
      // Update the selected image with annotated version
      if (data.annotated_image) {
        const updatedImage = {
          ...selectedImage,
          previewUrl: data.annotated_image
        };
        
        setSelectedImage(updatedImage);
        
        // Update this image in recent images list
        setRecentImages(prev => 
          prev.map(img => 
            img.fileName === selectedImage.fileName ? updatedImage : img
          )
        );
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
                    {selectedImage.fileName}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              </div>
              
              {/* Image List Section - Scrollable */}
              <div className="border border-gray-200 rounded-lg p-3 flex-1 overflow-y-auto min-h-0">
                <h2 className="text-gray-800 text-base font-medium mb-2">Recent Images</h2>
                {recentImages.filter(img => img.file !== null).length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {recentImages.filter(img => img.file !== null).map((img, i) => (
                      <div
                        key={i}
                        className={`border rounded-lg p-1 cursor-pointer transition hover:shadow
                          ${selectedImage.fileName === img.fileName ? 'ring-2 ring-blue-500' : 'border-gray-200'}
                        `}
                        onClick={() => handleImageSelect(img)}
                      >
                        <img
                          src={img.previewUrl}
                          alt={`Image ${i}`}
                          className="w-full aspect-square object-cover rounded"
                        />
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
              <div className="border border-gray-200 rounded-lg p-2 flex flex-col h-[50%] min-h-0">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-gray-800 text-sm font-medium">Preview & Prediction</h2>
                  <button 
                    className={`${isLoading ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'} text-white px-2 py-1 rounded-md text-xs`}
                    onClick={handlePredict}
                    disabled={isLoading || !selectedImage.file}
                  >
                    {isLoading ? 'Processing...' : 'Predict'}
                  </button>
                </div>
                
                {/* Image preview */}
                <div className="flex-1 flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden relative">
                  <img
                    src={selectedImage.previewUrl}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                  
                  {/* Results overlay */}
                  {resultsHistory.length > 0 && selectedImage.fileName === resultsHistory[0].filename && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-1 backdrop-blur-sm">
                      <p className="text-xs">Detected: {resultsHistory[0].detections.map((d: any) => `${d.class} (${(d.confidence * 100).toFixed(1)}%)`).join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Previous Prediction Results - Compact */}
              <div className="border border-gray-200 rounded-lg p-3 flex-1 overflow-y-auto min-h-0">
                <h2 className="text-gray-800 text-base font-medium mb-2">Prediction Results</h2>
                {resultsHistory.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {resultsHistory.map((result, index) => (
                      <div key={index} className="flex items-start gap-3 bg-gray-50 p-2 rounded-lg">
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
                            {result.detections.map((d: any, i: number) => (
                              <span key={`${d.class}-${i}`} className="inline-block bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs font-medium">
                                {d.class} ({(d.confidence * 100).toFixed(1)}%)
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400">Predicted at: {result.timestamp}</p>
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
      <Footer />
    </>
  );
}