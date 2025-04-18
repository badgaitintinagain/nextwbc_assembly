"use client"
import React, { useEffect, useRef, useState } from "react";

interface ImageItem {
  file: File | null;
  previewUrl: string;
  fileName: string;
  uploadTime?: number; // เพิ่มเวลาอัปโหลด
}

interface UploadRecord {
  fileName: string;
  timestamp: number;
}

const PredictDemo = () => {
  const [selectedImage, setSelectedImage] = useState<ImageItem>({
    file: null,
    previewUrl: "/images/imagen_pic.jpg",
    fileName: "No file selected"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [recentImages, setRecentImages] = useState<ImageItem[]>(
    Array(5).fill({
      file: null, 
      previewUrl: "/images/imagen_pic.jpg",
      fileName: "Default image"
    })
  );
  
  // สถานะสำหรับการจำกัดการอัปโหลด
  const [uploadLimitReached, setUploadLimitReached] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // โหลดประวัติการอัปโหลดจาก localStorage เมื่อ component โหลด
  useEffect(() => {
    checkUploadLimit();
    
    // ตั้งเวลาตรวจสอบทุก 1 นาที
    const interval = setInterval(() => {
      checkUploadLimit();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // ฟังก์ชันตรวจสอบการจำกัดการอัปโหลด
  const checkUploadLimit = () => {
    try {
      // ดึงประวัติการอัปโหลดจาก localStorage
      const storedUploads = localStorage.getItem('recentUploads');
      if (!storedUploads) {
        setUploadLimitReached(false);
        return;
      }
      
      const uploads: UploadRecord[] = JSON.parse(storedUploads);
      const oneHourAgo = Date.now() - 600000; // 1 hour in milliseconds
      
      // กรองเฉพาะการอัปโหลดใน 1 ชั่วโมงที่ผ่านมา
      const recentUploads = uploads.filter(upload => upload.timestamp > oneHourAgo);
      
      // บันทึกกลับ localStorage (ลบรายการเก่า)
      localStorage.setItem('recentUploads', JSON.stringify(recentUploads));
      
      // ตรวจสอบว่าถึงขีดจำกัดหรือไม่
      const isLimited = recentUploads.length >= 5;
      setUploadLimitReached(isLimited);
      
      // คำนวณเวลาที่เหลือจนกว่าจะสามารถอัปโหลดได้อีกครั้ง
      if (isLimited && recentUploads.length > 0) {
        const oldestUpload = recentUploads.reduce((oldest, current) => 
          current.timestamp < oldest.timestamp ? current : oldest
        );
        
        const resetTime = oldestUpload.timestamp + 600000;
        const timeLeft = resetTime - Date.now();
        
        if (timeLeft > 0) {
          const minutes = Math.floor(timeLeft / 60000);
          const seconds = Math.floor((timeLeft % 60000) / 1000);
          setTimeUntilReset(`${minutes}m ${seconds}s`);
        } else {
          setUploadLimitReached(false);
        }
      }
    } catch (error) {
      console.error("Error checking upload limit:", error);
    }
  };

  // ฟังก์ชันบันทึกประวัติการอัปโหลด
  const recordUpload = (fileName: string) => {
    try {
      // ดึงประวัติการอัปโหลดจาก localStorage
      const storedUploads = localStorage.getItem('recentUploads');
      let uploads: UploadRecord[] = storedUploads ? JSON.parse(storedUploads) : [];
      
      // เพิ่มการอัปโหลดใหม่
      uploads.push({
        fileName: fileName,
        timestamp: Date.now()
      });
      
      // บันทึกกลับ localStorage
      localStorage.setItem('recentUploads', JSON.stringify(uploads));
      
      // ตรวจสอบการจำกัดการอัปโหลดอีกครั้ง
      checkUploadLimit();
    } catch (error) {
      console.error("Error recording upload:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // ตรวจสอบข้อจำกัดการอัปโหลด
      if (uploadLimitReached) {
        alert(`Upload limit reached. Please wait ${timeUntilReset} before uploading more images.`);
        return;
      }
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImageItem: ImageItem = {
          file: selectedFile,
          previewUrl: reader.result as string,
          fileName: selectedFile.name,
          uploadTime: Date.now()
        };
        
        // บันทึกประวัติการอัปโหลด
        recordUpload(selectedFile.name);
        
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
    // ตรวจสอบข้อจำกัดการอัปโหลดก่อนเปิด file picker
    if (uploadLimitReached) {
      alert(`Upload limit reached. Please wait ${timeUntilReset} before uploading more images.`);
      return;
    }
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
    <div className="bg-white rounded-3xl shadow-md p-4 mt-8 px-4 max-w-5xl mx-auto">
      <div className="grid grid-cols-5 gap-2">
        {/* Left side */}
        <div className="col-span-2 flex flex-col gap-2">
          {/* Upload */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 aspect-square">
            <h1 className="text-center text-black text-lg">Upload Images Here</h1>
            <p className="text-center text-black text-xs mb-3">Up to 5 Images per 60 Minutes</p>
            
            {uploadLimitReached && (
              <div className="text-red-500 text-xs text-center mb-2">
                Upload limit reached. Please wait {timeUntilReset} before uploading more images.
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*" 
              className="hidden" 
            />
            <button 
              className={`${uploadLimitReached ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded-xl transition`}
              onClick={handleUploadClick}
              disabled={uploadLimitReached}
            >
              Upload
            </button>
          </div>

          {/* Recent images */}
          <div className="grid grid-cols-5 gap-1.5">
            {recentImages.map((img, i) => (
              <div
                key={i}
                className={`flex items-center justify-center border-2 border-dashed rounded-xl p-1 aspect-square cursor-pointer
                  ${img.file ? 'border-gray-200 hover:border-blue-400' : 'border-gray-200'}
                  ${selectedImage.fileName === img.fileName ? 'ring-2 ring-blue-500' : ''}
                `}
                onClick={() => handleImageSelect(img)}
              >
                <img
                  src={img.previewUrl}
                  alt={`Image ${i}`}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="col-span-3 flex flex-col border-dashed border-2 rounded-xl border-gray-200 p-3 aspect-[4/3.2]">
          {/* Top bar */}
          <div className="flex items-center gap-2 mb-3">
            <button 
              className={`${isLoading ? 'bg-gray-400' : 'bg-orange-500'} text-white px-4 py-2 rounded-xl hover:${isLoading ? 'bg-gray-400' : 'bg-orange-600'} transition`}
              onClick={handlePredict}
              disabled={isLoading || !selectedImage.file}
            >
              {isLoading ? 'Processing...' : 'Predict'}
            </button>
            <div className="bg-gray-100 text-black text-sm px-3 py-2 rounded-xl border border-gray-300 flex-1 truncate">
              {selectedImage.fileName}
            </div>
          </div>

          {/* Image preview */}
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl overflow-hidden relative">
            <img
              src={selectedImage.previewUrl}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            
            {/* Results overlay */}
            {results && selectedImage.fileName === results.filename && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 text-sm">
                <p>Detected: {results.detections.map((d: any) => `${d.class} (${(d.confidence * 100).toFixed(1)}%)`).join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictDemo;
