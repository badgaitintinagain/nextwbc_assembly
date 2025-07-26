"use client"
import React, { useRef, useState, useCallback, useMemo } from "react";

interface ImageItem {
  file: File | null;
  previewUrl: string;
  fileName: string;
}

interface Detection {
  class: string;
  confidence: number;
  box: number[];
}

interface PredictResponse {
  filename: string;
  detections: Detection[];
  annotated_image?: string;
}

const PredictDemo = React.memo(() => {
  const [selectedImage, setSelectedImage] = useState<ImageItem>({
    file: null,
    previewUrl: '',
    fileName: 'No file selected'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PredictResponse | null>(null);
  const [recentImages, setRecentImages] = useState<ImageItem[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoize computed values
  const isSubmitDisabled = useMemo(() => 
    isLoading || !selectedImage.file, 
    [isLoading, selectedImage.file]
  );

  const detectionSummary = useMemo(() => {
    if (!results || selectedImage.fileName !== results.filename) return null;
    return results.detections.map(d => `${d.class} (${(d.confidence * 100).toFixed(1)}%)`).join(', ');
  }, [results, selectedImage.fileName]);

  // Use useCallback for event handlers to prevent unnecessary re-renders
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, []);

  const handleImageSelect = useCallback((image: ImageItem) => {
    // Only allow selecting real uploaded images
    if (image.file !== null) {
      setSelectedImage(image);
    }
  }, []);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handlePredict = useCallback(async () => {
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
      setResults(data);
      
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
  }, [selectedImage]);

  return (
    <div className="relative bg-gradient-to-br from-white/20 via-white/10 to-white/5 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-6 w-full max-w-full md:max-w-[800px] mx-auto flex flex-col gap-6 overflow-hidden">
      {/* Decorative glass effect elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-6 left-6 w-20 h-20 bg-gradient-to-br from-white/25 to-transparent rounded-full blur-sm"></div>
        <div className="absolute bottom-10 right-8 w-16 h-16 bg-gradient-to-tl from-blue-400/30 to-transparent rounded-full blur-sm"></div>
        <div className="absolute top-1/2 right-12 w-12 h-12 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-sm"></div>
        <div className="absolute bottom-1/3 left-8 w-8 h-8 bg-gradient-to-tr from-cyan-400/25 to-transparent rounded-full blur-sm"></div>
      </div>

      {/* Glass morphism header gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-cyan-500/40 rounded-t-3xl"></div>

      <div className="relative z-10 flex flex-col min-h-0" style={{ maxHeight: '60vh' }}>
        {/* Centered content */}
        <div className="flex flex-col min-h-0 gap-4 justify-center" style={{ maxHeight: '50vh' }}>
          {/* Enhanced top bar with glass effects */}
          <div className="flex items-center gap-3 mb-2 justify-center">
            <button 
              className={`${
                isLoading 
                  ? 'bg-gray-400/60 cursor-not-allowed backdrop-blur-sm' 
                  : 'bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-600/90 hover:to-purple-600/90 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105'
              } text-white px-6 py-3 rounded-2xl transition-all duration-300 text-sm font-medium min-w-[100px] border border-white/20`}
              onClick={handlePredict}
              disabled={isSubmitDisabled}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Predict
                </span>
              )}
            </button>
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 text-white/90 text-sm px-5 py-3 rounded-2xl flex-1 max-w-xs truncate shadow-inner">
              <span className="drop-shadow-sm">{selectedImage.fileName}</span>
            </div>
          </div>

          {/* Enhanced image preview with liquid glass effects */}
          <div className="flex flex-col border border-white/40 bg-white/15 backdrop-blur-lg rounded-2xl overflow-hidden relative shadow-xl" style={{ height: '280px', maxHeight: '40vh' }}>
            <div className="flex items-center justify-center w-full h-full relative overflow-hidden p-0 m-0">
              {/* Blurred BG and Main Preview, or placeholder if no image */}
              {selectedImage.previewUrl ? (
                <>
                  <img
                    src={selectedImage.previewUrl}
                    alt="Preview BG"
                    className="absolute inset-0 w-full h-full object-cover blur-xl brightness-50 z-0 select-none pointer-events-none"
                  />
                  <img
                    src={selectedImage.previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain z-10 block drop-shadow-lg"
                  />
                  {/* Enhanced results overlay with glass effect */}
                  {results && selectedImage.fileName === results.filename && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-md text-white p-3 text-sm rounded-b-2xl z-20 border-t border-white/20">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="drop-shadow-sm">
                          <span className="text-green-400 font-medium">Detected:</span> {detectionSummary}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full z-10 relative">
                  {/* Glass morphism background for upload area */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm"></div>
                  <button
                    className="relative flex flex-col items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 hover:border-white/50 rounded-2xl shadow-lg hover:shadow-xl px-10 py-8 transition-all duration-300 text-base font-medium gap-3 focus:outline-none focus:ring-2 focus:ring-white/50 group hover:scale-105"
                    onClick={handleUploadClick}
                  >
                    <div className="flex items-center justify-center mb-2 p-3 rounded-full bg-gradient-to-br from-blue-400/30 to-purple-400/30 backdrop-blur-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white drop-shadow-sm group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold text-white drop-shadow-sm">Upload Image</span>
                    <span className="text-sm text-white/80 drop-shadow-sm">JPEG/PNG • Max 10MB</span>
                  </button>
                </div>
              )}
            </div>
            {/* Enhanced floating tray with glass morphism - Fixed centering */}
            {recentImages.length > 0 && (
              <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center pointer-events-none">
                <div className="flex justify-center gap-2 px-3 py-2 bg-white/30 backdrop-blur-md rounded-2xl shadow-lg min-h-[44px] border border-white/40 pointer-events-auto animate-slideDown" style={{maxWidth:'90%'}}>
                  {recentImages.map((img, i) => (
                    <div
                      key={i}
                      className={`h-10 w-10 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-110 ${
                        selectedImage.fileName === img.fileName 
                          ? 'ring-2 ring-blue-400 shadow-lg' 
                          : 'border border-white/30 hover:border-white/50 shadow-md hover:shadow-lg'
                      }`}
                      onClick={() => handleImageSelect(img)}
                    >
                      <img
                        src={img.previewUrl}
                        alt={`Thumb ${i}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Enhanced floating upload button with glass effect */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*" 
              className="hidden" 
            />
            {selectedImage.previewUrl && (
              <button 
                className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur-sm hover:from-blue-600/95 hover:to-purple-600/95 text-white p-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center z-30 border border-white/30 hover:scale-110 group"
                style={{ width: 48, height: 48 }}
                onClick={handleUploadClick}
                title="Upload new image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

PredictDemo.displayName = 'PredictDemo';
export default PredictDemo;
