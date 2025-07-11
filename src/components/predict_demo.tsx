"use client"
import React, { useRef, useState } from "react";

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

const PredictDemo = () => {
  const [selectedImage, setSelectedImage] = useState<ImageItem>({
    file: null,
    previewUrl: '',
    fileName: 'No file selected'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PredictResponse | null>(null);
  const [recentImages, setRecentImages] = useState<ImageItem[]>([]);
  
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
  };

  return (
    <div className="bg-white/30 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl p-8 max-w-4xl w-full mx-auto flex flex-col gap-8">
      <div className="flex flex-col min-h-0" style={{ maxHeight: '70vh' }}>
        {/* Remove left panel entirely to let preview fill all space */}

        {/* Centered content */}
        <div className="flex flex-col min-h-0 gap-4 justify-center" style={{ maxHeight: '60vh' }}>
          {/* Top bar */}
          <div className="flex items-center gap-4 mb-4 justify-center">
            <button 
              className={`${isLoading ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'} text-white px-8 py-4 rounded-full transition text-base font-medium min-w-[140px] shadow-lg hover:shadow-xl transform hover:scale-105`}
              onClick={handlePredict}
              disabled={isLoading || !selectedImage.file}
            >
              {isLoading ? 'Processing...' : 'Predict'}
            </button>
            <div className="bg-white/20 backdrop-blur border border-white/30 text-white text-sm px-6 py-4 rounded-full flex-1 max-w-md truncate shadow-inner">
              {selectedImage.fileName}
            </div>
          </div>

          {/* Image preview with floating tray */}
          <div className="flex flex-col border-2 border-white/30 bg-white/10 backdrop-blur rounded-xl overflow-hidden relative" style={{ height: '400px', maxHeight: '50vh' }}>
            <div className="flex items-center justify-center w-full h-full relative overflow-hidden p-0 m-0">
              {/* Blurred BG and Main Preview, or placeholder if no image */}
              {selectedImage.previewUrl ? (
                <>
                  <img
                    src={selectedImage.previewUrl}
                    alt="Preview BG"
                    className="absolute inset-0 w-full h-full object-cover blur-2xl brightness-50 z-0 select-none pointer-events-none"
                  />
                  <img
                    src={selectedImage.previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain z-10 block"
                  />
                  {/* Results overlay */}
                  {results && selectedImage.fileName === results.filename && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 text-sm rounded-b-xl z-20">
                      <p>Detected: {results.detections.map(d => `${d.class} (${(d.confidence * 100).toFixed(1)}%)`).join(', ')}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/40 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white/70 text-sm">No image selected</span>
                </div>
              )}
            </div>
            {/* Floating tray */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-20 flex justify-center gap-2 px-4 py-2 bg-white/60 rounded-xl shadow-lg min-h-[56px] border border-white/30 backdrop-blur-md pointer-events-auto" style={{maxWidth:'90%'}}>
              {recentImages.map((img, i) => (
                <div
                  key={i}
                  className={`h-12 w-12 flex-shrink-0 rounded overflow-hidden cursor-pointer ${selectedImage.fileName === img.fileName ? 'ring-2 ring-blue-500' : 'border border-gray-200'}`}
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
            {/* Floating upload button at bottom right */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*" 
              className="hidden" 
            />
            <button 
              className="absolute bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition flex items-center justify-center z-30"
              style={{ width: 48, height: 48 }}
              onClick={handleUploadClick}
              title="Upload image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictDemo;
