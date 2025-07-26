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
    <div className="bg-white/60 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-4 w-full max-w-full md:max-w-[800px] mx-auto flex flex-col gap-4">
      <div className="flex flex-col min-h-0" style={{ maxHeight: '60vh' }}>
        {/* Centered content */}
        <div className="flex flex-col min-h-0 gap-2 justify-center" style={{ maxHeight: '50vh' }}>
          {/* Top bar */}
          <div className="flex items-center gap-2 mb-2 justify-center">
            <button 
              className={`${isLoading ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'} text-white px-5 py-2 rounded-full transition text-sm font-medium min-w-[90px] shadow-md hover:shadow-lg`} 
              onClick={handlePredict}
              disabled={isSubmitDisabled}
              style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}
            >
              {isLoading ? 'Processing...' : 'Predict'}
            </button>
            <div className="bg-white/40 backdrop-blur border border-white/40 text-gray-700 text-xs px-4 py-2 rounded-full flex-1 max-w-xs truncate shadow-inner">
              {selectedImage.fileName}
            </div>
          </div>

          {/* Image preview with floating tray */}
          <div className="flex flex-col border border-white/40 bg-white/20 backdrop-blur rounded-xl overflow-hidden relative" style={{ height: '260px', maxHeight: '40vh' }}>
            <div className="flex items-center justify-center w-full h-full relative overflow-hidden p-0 m-0">
              {/* Blurred BG and Main Preview, or placeholder if no image */}
              {selectedImage.previewUrl ? (
                <>
                  <img
                    src={selectedImage.previewUrl}
                    alt="Preview BG"
                    className="absolute inset-0 w-full h-full object-cover blur-xl brightness-75 z-0 select-none pointer-events-none"
                  />
                  <img
                    src={selectedImage.previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain z-10 block"
                  />
                  {/* Results overlay */}
                  {results && selectedImage.fileName === results.filename && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs rounded-b-xl z-20">
                      <p>Detected: {detectionSummary}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full z-10">
                  <button
                    className="flex flex-col items-center justify-center bg-white border border-blue-200 hover:border-blue-400 rounded-xl shadow-md hover:shadow-lg px-8 py-7 transition-all duration-200 text-base font-medium gap-2 focus:outline-none focus:ring-2 focus:ring-blue-200 group"
                    onClick={handleUploadClick}
                  >
                    <span className="flex items-center justify-center mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400 group-hover:text-blue-500 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </span>
                    <span className="text-lg font-semibold text-gray-800">Upload Image</span>
                    <span className="text-xs text-gray-400 mt-1">JPEG/PNG only</span>
                  </button>
                </div>
              )}
            </div>
            {/* Floating tray */}
            {recentImages.length > 0 && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-3 z-20 flex justify-center gap-1 px-2 py-1 bg-white/70 rounded-lg shadow-md min-h-[36px] border border-white/40 backdrop-blur pointer-events-auto" style={{maxWidth:'90%'}}>
                {recentImages.map((img, i) => (
                  <div
                    key={i}
                    className={`h-8 w-8 flex-shrink-0 rounded overflow-hidden cursor-pointer ${selectedImage.fileName === img.fileName ? 'ring-2 ring-blue-400' : 'border border-gray-200'}`}
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
            )}
            {/* Floating upload button at bottom right */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*" 
              className="hidden" 
            />
            {selectedImage.previewUrl && (
              <button 
                className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition flex items-center justify-center z-30 border-2 border-white"
                style={{ width: 40, height: 40, boxShadow: '0 2px 8px 0 rgba(0,0,0,0.12)' }}
                onClick={handleUploadClick}
                title="Upload image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
