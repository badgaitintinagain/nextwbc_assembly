"use client";

import ClassDistributionChart from "@/components/distributegraph";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { useEffect, useState } from "react";

export default function Vault() {
    // State สำหรับ logs, selected log และ image
    const [logs, setLogs] = useState([]);
    const [selectedLog, setSelectedLog] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // ดึงข้อมูล logs จาก database
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/predictions');
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch prediction logs');
                }
                
                const data = await response.json();
                console.log('Fetched data:', data); // เพิ่ม log เพื่อ debug
                
                // ตรวจสอบโครงสร้างข้อมูล
                if (!Array.isArray(data)) {
                    throw new Error('Invalid data format: expected an array');
                }
                
                // แปลงข้อมูลด้วยความระมัดระวัง
                const formattedLogs = data.map(log => ({
                    id: log.id,
                    timestamp: new Date(log.timestamp).toLocaleString(),
                    imageCount: log.imageCount || 0,
                    detections: log.detections || [],
                    // สร้าง URL สำหรับดึงรูปภาพ เฉพาะรูปที่มีข้อมูล
                    images: Array.isArray(log.images) 
                        ? log.images.map(img => `/api/predictions/images/${img.id}`) 
                        : [],
                    annotatedImages: Array.isArray(log.images) 
                        ? log.images.map(img => `/api/predictions/images/${img.id}?type=annotated`) 
                        : []
                }));
                
                setLogs(formattedLogs);
            } catch (err) {
                console.error('Error fetching prediction logs:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchLogs();
    }, []);

    // Handle log selection
    const handleLogSelect = (log) => {
        setSelectedLog(log);
        if (log.images && log.images.length > 0) {
            setSelectedImage(log.images[0]); // Select first image by default
        }
    };

    // Handle image selection
    const handleImageSelect = (image) => {
        setSelectedImage(image);
    };

    // Toggle bounding boxes
    const toggleBoundingBoxes = () => {
        setShowBoundingBoxes(!showBoundingBoxes);
    };

    // Get the appropriate image to display (original or with bounding boxes)
    const getDisplayImage = () => {
        if (!selectedImage) return null;
        
        // If showing bounding boxes, try to get annotated image
        if (showBoundingBoxes) {
            const index = selectedLog.images.indexOf(selectedImage);
            if (index !== -1 && selectedLog?.annotatedImages && selectedLog.annotatedImages[index]) {
                return selectedLog.annotatedImages[index];
            }
        }
        
        // Fallback to original image
        return selectedImage;
    };

    // แก้ไขส่วน Detection Summary ในโค้ดเดิม

    // เพิ่มฟังก์ชัน helper ก่อน return statement
    const getGroupedDetections = () => {
        if (!selectedLog?.detections) return {};
        
        // จัดกลุ่ม detections ตามประเภท (class)
        const grouped = {};
        
        selectedLog.detections.forEach((detection, index) => {
            // หา imageIndex โดยใช้ metadata ถ้ามี หรือใช้ default ที่ 0
            const imageIndex = detection.imageIndex !== undefined ? detection.imageIndex : 0;
            
            if (!grouped[detection.class]) {
                grouped[detection.class] = [];
            }
            
            grouped[detection.class].push({
                ...detection,
                detectionIndex: index,
                imageIndex: imageIndex
            });
        });
        
        return grouped;
    };

    // ฟังก์ชันสำหรับนำทางไปยังรูปภาพที่มีการตรวจจับนี้
    const navigateToDetectionImage = (imageIndex) => {
      console.log("Navigating to image index:", imageIndex); // ดูค่า imageIndex ที่ได้รับ
      
      if (selectedLog?.images && selectedLog.images[imageIndex]) {
        console.log("Found image at index:", imageIndex, "URL:", selectedLog.images[imageIndex]);
        setSelectedImage(selectedLog.images[imageIndex]);
      } else {
        console.error("No image found at index:", imageIndex, "Available images:", selectedLog?.images?.length || 0);
      }
    };

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-4 overflow-hidden">
                <div className="grid grid-cols-5 h-full gap-4">
                    <div className="overflow-y-auto bg-white rounded-lg shadow p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Prediction Logs</h3>
                        {logs.length === 0 ? (
                            <div className="text-center p-6 text-gray-500">
                                {isLoading ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                        <p>Loading Prediction Data...</p>
                                    </div>
                                ) : error ? (
                                    <div>
                                        <p>Error due Loading Data</p>
                                        <p className="text-sm mt-2 text-red-500">{error}</p>
                                    </div>
                                ) : (
                                    <>
                                        <p>No Prediction Result History</p>
                                        <p className="text-sm mt-2">Predict at Prediction to see a results here</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {logs.map(log => (
                                    <div 
                                        key={log.id} 
                                        className={`bg-white rounded-lg shadow p-3 hover:shadow-md transition-shadow cursor-pointer ${selectedLog?.id === log.id ? 'ring-2 ring-blue-500' : ''}`}
                                        onClick={() => handleLogSelect(log)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded overflow-hidden">
                                                {log.images && log.images[0] ? (
                                                    <img 
                                                        src={log.images[0]} 
                                                        alt="First image" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                                        <span className="text-xs text-gray-500">No image</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-600">{log.timestamp}</p>
                                                <p className="text-xs text-gray-500">{log.imageCount} images</p>
                                                {log.detections && log.detections.length > 0 && (
                                                    <p className="text-xs text-blue-500 mt-1">
                                                        {log.detections.length} detections
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="col-span-3 bg-white rounded-lg shadow p-4">
                        {selectedLog ? (
                            <div className="h-full flex flex-col">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Images from {selectedLog.timestamp}</h3>
                                
                                {/* Smaller Image Tray - Single Row with max 10 images */}
                                <div className="mb-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-sm font-medium text-gray-700">Image Tray</h4>
                                        <div className="flex items-center">
                                            <label className="inline-flex items-center cursor-pointer mr-2">
                                                <input 
                                                    type="checkbox" 
                                                    checked={showBoundingBoxes} 
                                                    onChange={toggleBoundingBoxes}
                                                    className="sr-only peer"
                                                />
                                                <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                                                <span className="ml-2 text-xs text-gray-600">Bounding Boxes</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 overflow-x-auto p-1 border border-gray-200 rounded-lg">
                                        {selectedLog.images.slice(0, 10).map((image, index) => (
                                            <div 
                                                key={index}
                                                className={`flex-shrink-0 h-12 w-12 bg-gray-200 rounded overflow-hidden cursor-pointer ${selectedImage === image ? 'ring-2 ring-blue-500' : ''}`}
                                                onClick={() => handleImageSelect(image)}
                                            >
                                                <img 
                                                    src={image} 
                                                    alt={`Image ${index + 1}`} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                        {selectedLog.images.length > 10 && (
                                            <div className="flex-shrink-0 h-12 px-2 bg-gray-100 rounded flex items-center justify-center">
                                                <span className="text-xs text-gray-500">+{selectedLog.images.length - 10} more</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Image Preview with Bounding Box Toggle */}
                                {selectedImage && (
                                    <div className="flex-1 relative">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                                        <div className="w-full h-[calc(100vh-20rem)] bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                            <img 
                                                src={getDisplayImage()} 
                                                alt="Preview" 
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        </div>
                                        {showBoundingBoxes && getDisplayImage() === selectedImage && (
                                            <div className="absolute bottom-2 right-2 bg-yellow-100 text-yellow-800 text-xs p-1 rounded">
                                                No bounding box data available
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                <p>Select a log entry to view details</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="col-start-5 bg-white rounded-lg shadow p-4 overflow-y-auto">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Statistics</h3>
                        {selectedLog ? (
                            <div>
                                {/* Class Distribution Chart */}
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Class Distribution</h4>
                                    {selectedLog.detections && selectedLog.detections.length > 0 ? (
                                        <div className="bg-gray-50 p-3 rounded">
                                            <ClassDistributionChart detections={selectedLog.detections} />
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No data available for chart</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Detection Summary</h4>
                                    {selectedLog?.detections && selectedLog.detections.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(getGroupedDetections()).map(([className, detections]) => (
                                                <div key={className} className="bg-gray-50 p-3 rounded">
                                                    <p className="text-sm font-medium text-gray-800 mb-1">{className}</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {detections.map((detection, idx) => (
                                                            <span 
                                                              key={idx} 
                                                              onClick={() => navigateToDetectionImage(detection.imageIndex)}
                                                              className="inline-block bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded cursor-pointer hover:bg-blue-200"
                                                              title={`Click to view in image ${detection.imageIndex + 1}${
                                                                selectedLog.images[detection.imageIndex] 
                                                                  ? ` (${selectedLog.images[detection.imageIndex].split('/').pop() || 'Unknown'})` 
                                                                  : ''
                                                              }`}
                                                            >
                                                              {(detection.confidence * 100).toFixed(1)}%
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No detections available</p>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Log Details</h4>
                                    <p className="text-sm text-gray-600">Time: {selectedLog.timestamp}</p>
                                    <p className="text-sm text-gray-600">Images: {selectedLog.imageCount}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">Select a log to view statistics</p>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}