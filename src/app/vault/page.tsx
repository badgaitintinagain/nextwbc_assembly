"use client"
import DistributeGraph from "@/components/distributegraph";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { useEffect, useState } from "react";

interface Detection {
  class: string;
  confidence: number;
  imageIndex: number;
  box?: [number, number, number, number]; // Add box property for bounding box coordinates
}

// Updated Log interface to match the database structure
interface Log {
  id: string;
  userId: string;
  timestamp: string;
  imageCount: number;
  title?: string; // Add title field for logs
  description?: string; // Add description field for logs
  images?: Array<{
    id: string;
    originalImage?: string; // Base64 encoded image data
    annotatedImage?: string;
    mimeType: string;
    filename: string;
  }>;
  detections?: Detection[];
}

export default function Vault() {
  // State สำหรับ logs, selected log และ image
  const [logs, setLogs] = useState<Log[]>([]);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);

  // Add state for log management
  const [selectedLogsForDeletion, setSelectedLogsForDeletion] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [logToRename, setLogToRename] = useState<Log | null>(null);
  const [newLogTitle, setNewLogTitle] = useState('');
  const [newLogDescription, setNewLogDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // ดึงข้อมูล logs จาก database
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/predictions');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch prediction logs: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Raw API response:', data); // Debug log to inspect response
        
        if (!Array.isArray(data)) {
          console.error('API did not return an array as expected:', data);
          setLogs([]);
          return;
        }
        
        // Process the data to ensure images are properly formatted
        const processedLogs = data.map((log: any) => {
          try {
            return {
              id: log.id || `temp-${Date.now()}-${Math.random()}`,
              userId: log.userId || 'unknown',
              timestamp: log.timestamp ? new Date(log.timestamp).toLocaleString() : new Date().toLocaleString(),
              imageCount: log.imageCount || (Array.isArray(log.images) ? log.images.length : 0),
              title: log.title || '', // Include the title if available
              description: log.description || '', // Include the description if available
              // Ensure images are properly processed
              images: Array.isArray(log.images) 
                ? log.images.map((img: any) => ({
                    id: img.id || `img-${Date.now()}-${Math.random()}`,
                    originalImage: img.originalImage || null,
                    annotatedImage: img.annotatedImage || null,
                    mimeType: img.mimeType || 'image/jpeg',
                    filename: img.filename || 'image.jpg'
                  }))
                : [],
              detections: Array.isArray(log.detections) ? log.detections : []
            };
          } catch (err) {
            console.error('Error processing log entry:', err, log);
            // Return a minimal valid log entry if processing fails
            return {
              id: log.id || `error-${Date.now()}`,
              userId: 'error',
              timestamp: new Date().toLocaleString(),
              imageCount: 0,
              images: [],
              detections: []
            };
          }
        });
        
        console.log('Processed logs:', processedLogs); // Debug log to inspect processed data
        setLogs(processedLogs);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching prediction logs:', err);
        setError(err.message);
        setLogs([]); // Ensure logs is always an array even on error
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLogs();
  }, []);

  // Helper function to get image URL from potentially object data
  const getImageUrl = (imageData: any): string | null => {
    if (!imageData) return null;
    
    try {
      // Handle string URLs directly (legacy data or already processed)
      if (typeof imageData === 'string') return imageData;
      
      // Handle database image objects
      if (typeof imageData === 'object') {
        // If it's a database image object with original or annotated image data
        if (imageData.originalImage) {
          return `data:${imageData.mimeType || 'image/jpeg'};base64,${imageData.originalImage}`;
        }
        if (imageData.annotatedImage) {
          return `data:${imageData.mimeType || 'image/jpeg'};base64,${imageData.annotatedImage}`;
        }
        
        // Legacy format handling
        if (imageData.url) return imageData.url;
        if (imageData.src) return imageData.src;
        if (imageData.path) return imageData.path;
      }
    } catch (err) {
      console.error('Error getting image URL:', err, imageData);
    }
    return null;
  };
  
  // Helper function to extract filename from image data
  const getImageFilename = (imageData: any): string => {
    if (!imageData) return 'Unknown';
    
    // If imageData is an object with a filename property
    if (typeof imageData === 'object' && imageData.filename) {
      return imageData.filename;
    }
    
    // Otherwise try to extract from URL
    const url = getImageUrl(imageData);
    if (!url) return 'Unknown';
    if (url.startsWith('data:')) return 'Image'; // Data URLs don't have filenames
    
    try {
      return url.split('/').pop() || 'Unknown';
    } catch (e) {
      return 'Unknown';
    }
  };

  // เลือก log
  const handleLogSelect = (log: Log) => {
    setSelectedLog(log);
    setSelectedImage(log.images && log.images.length > 0 ? getImageUrl(log.images[0]) : null);
  };

  // เลือกรูปภาพจาก log
  const handleImageSelect = (image: any) => {
    setSelectedImage(getImageUrl(image));
  };

  // Toggle bounding boxes
  const toggleBoundingBoxes = () => {
    setShowBoundingBoxes(!showBoundingBoxes);
  };

  // Get image to display - original or annotated
  const getDisplayImage = () => {
    if (!selectedImage) return null;
    
    // If we have the selected image and bounding boxes are enabled,
    // we should look for an annotated version of the image
    if (showBoundingBoxes && selectedLog?.images) {
      // Find the current image in the log's images
      const currentImageIndex = selectedLog.images.findIndex(img => 
        getImageUrl(img) === selectedImage
      );
      
      if (currentImageIndex >= 0) {
        const image = selectedLog.images[currentImageIndex];
        // If we have an annotated version, use it
        if (image.annotatedImage) {
          return `data:${image.mimeType || 'image/jpeg'};base64,${image.annotatedImage}`;
        }
      }
    }
    
    // Otherwise return the selected image (original)
    return selectedImage;
  };

  // Get detections for the current image
  const getCurrentImageDetections = () => {
    if (!selectedLog?.detections || !selectedLog?.images) return [];
    
    const currentImageIndex = selectedLog.images.findIndex(img => 
      getImageUrl(img) === selectedImage
    );
    
    if (currentImageIndex >= 0) {
      return selectedLog.detections.filter(detection => 
        detection.imageIndex === currentImageIndex
      );
    }
    
    return [];
  };

  // Handle confidence click to switch to the image with that detection
  const handleConfidenceClick = (detection: Detection) => {
    if (!selectedLog?.images || detection.imageIndex >= selectedLog.images.length) {
      return;
    }
    
    const targetImage = selectedLog.images[detection.imageIndex];
    setSelectedImage(getImageUrl(targetImage));
  };

  // Render bounding boxes on the image
  const renderBoundingBoxes = (imgRef: HTMLImageElement) => {
    if (!imgRef || !showBoundingBoxes) return null;
    
    const detections = getCurrentImageDetections();
    if (detections.length === 0) return null;
    
    return detections.map((detection, idx) => {
      if (!detection.box) {
        return null;
      }
      
      const [x, y, width, height] = detection.box;
      const style = {
        position: 'absolute' as 'absolute',
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: `${width * 100}%`,
        height: `${height * 100}%`,
        border: `2px solid ${getColorForClass(detection.class)}`,
        boxSizing: 'border-box' as 'border-box'
      };
      
      return (
        <div key={idx} style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}>
          <div style={style}>
            <div 
              className="text-white text-xs px-1 py-0.5 absolute top-0 left-0 transform -translate-y-full"
              style={{ backgroundColor: getColorForClass(detection.class) }}
            >
              {detection.class} {(detection.confidence * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      );
    });
  };

  // Get color for detection class
  const getColorForClass = (className: string) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    
    let hash = 0;
    for (let i = 0; i < className.length; i++) {
      hash = className.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Image reference callback
  const imgRefCallback = (node: HTMLImageElement | null) => {
    if (node) {
      setImageRef(node);
    }
  };

  // Handle delete logs
  const handleDeleteLogs = async () => {
    if (selectedLogsForDeletion.length === 0) return;
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/predictions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logIds: selectedLogsForDeletion
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete logs: ${response.status}`);
      }
      
      // Remove deleted logs from state
      setLogs(prevLogs => prevLogs.filter(log => !selectedLogsForDeletion.includes(log.id)));
      setSelectedLogsForDeletion([]);
      setIsDeleteModalOpen(false);
      
      // If the currently selected log was deleted, clear the selection
      if (selectedLog && selectedLogsForDeletion.includes(selectedLog.id)) {
        setSelectedLog(null);
        setSelectedImage(null);
      }
      
    } catch (error) {
      console.error('Error deleting logs:', error);
      alert('Failed to delete logs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle rename log
  const handleRenameLog = async () => {
    if (!logToRename) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/predictions/${logToRename.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newLogTitle,
          description: newLogDescription
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update log: ${response.status}`);
      }
      
      // Update the log in state
      setLogs(prevLogs => prevLogs.map(log => 
        log.id === logToRename.id 
          ? { ...log, title: newLogTitle, description: newLogDescription }
          : log
      ));
      
      // Update selected log if it's the one being edited
      if (selectedLog && selectedLog.id === logToRename.id) {
        setSelectedLog(prev => prev ? { ...prev, title: newLogTitle, description: newLogDescription } : null);
      }
      
      setIsRenameModalOpen(false);
      setLogToRename(null);
      setNewLogTitle('');
      setNewLogDescription('');
      
    } catch (error) {
      console.error('Error updating log:', error);
      alert('Failed to update log. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle log selection for deletion
  const toggleLogSelection = (logId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedLogsForDeletion(prev => 
      prev.includes(logId) 
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };

  // Open rename modal
  const openRenameModal = (log: Log, event: React.MouseEvent) => {
    event.stopPropagation();
    setLogToRename(log);
    setNewLogTitle(log.title || '');
    setNewLogDescription(log.description || '');
    setIsRenameModalOpen(true);
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    // Clear selections when exiting edit mode
    if (isEditing) {
      setSelectedLogsForDeletion([]);
    }
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
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 overflow-hidden">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-6 h-full">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6 h-full">
              {/* Column 1: Log List - Takes full width on mobile, 3/12 columns on larger screens */}
              <div className="md:col-span-1 lg:col-span-3 bg-white/95 rounded-lg border border-gray-100 shadow-sm h-[35vh] md:h-auto overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-800">Prediction Logs</h3>
                  <div className="flex space-x-2">
                    {/* Edit mode toggle button */}
                    <button
                      className={`text-xs px-2.5 py-1.5 rounded-md transition-all ${
                        isEditing 
                          ? 'bg-blue-50 text-blue-600 font-medium' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={toggleEditMode}
                    >
                      {isEditing ? 'Done' : 'Edit'}
                    </button>
                    
                    {/* Delete button - only shown in edit mode */}
                    {isEditing && (
                      <button
                        className={`text-xs px-2.5 py-1.5 rounded-md transition-all ${
                          selectedLogsForDeletion.length > 0
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 font-medium'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                        onClick={() => {
                          if (selectedLogsForDeletion.length > 0) {
                            setIsDeleteModalOpen(true);
                          }
                        }}
                        disabled={selectedLogsForDeletion.length === 0}
                      >
                        Delete ({selectedLogsForDeletion.length})
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="h-[calc(100%-60px)] overflow-hidden">
                  {logs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center p-6 text-gray-500">
                      {isLoading ? (
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                          <p>Loading Prediction Data...</p>
                        </div>
                      ) : error ? (
                        <div>
                          <p className="font-medium">Error Loading Data</p>
                          <p className="text-sm mt-2 text-red-500">{error}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="font-medium">No Prediction History</p>
                          <p className="text-sm mt-2">Create a new prediction to see results here</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-0 h-full overflow-y-auto p-4">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className={`bg-white border border-gray-100 hover:border-gray-200 rounded-md p-3 mb-3 hover:shadow-sm transition-all cursor-pointer ${
                            selectedLog?.id === log.id ? 'ring-2 ring-blue-500 border-transparent shadow-sm' : ''
                          }`}
                          onClick={() => !isEditing && handleLogSelect(log)}
                        >
                          <div className="flex items-center space-x-3">
                            {/* Checkbox for selection in edit mode */}
                            {isEditing && (
                              <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={selectedLogsForDeletion.includes(log.id)}
                                  onChange={(e) => toggleLogSelection(log.id, e)}
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                              </div>
                            )}
                            
                            <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden">
                              {log.images && log.images[0] ? (
                                <img
                                  src={getImageUrl(log.images[0]) || undefined}
                                  alt="First image"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-xs text-gray-500">No image</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center">
                                <p className="text-sm text-gray-800 font-medium truncate">
                                  {log.title || `Log ${log.timestamp}`}
                                </p>
                              </div>
                              <p className="text-xs text-gray-500 truncate">{log.timestamp}</p>
                              <div className="flex items-center mt-1 space-x-2">
                                <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                  {log.imageCount} images
                                </span>
                                {log.detections && log.detections.length > 0 && (
                                  <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                                    {log.detections.length} detections
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Columns 2-3: Image Preview - Takes full width on mobile, 6/12 columns on larger screens */}
              <div className="md:col-span-2 lg:col-span-6 bg-white/95 rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                {selectedLog ? (
                  <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-semibold text-gray-800">
                          {selectedLog.title || selectedLog.timestamp}
                        </h3>
                        {/* Edit button with pencil icon */}
                        <button
                          className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                          onClick={(e) => openRenameModal(selectedLog, e)}
                          title="Edit title and description"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium text-gray-700">
                          Image Tray
                        </h4>
                        <div className="ml-auto">
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={showBoundingBoxes}
                              onChange={toggleBoundingBoxes}
                              className="sr-only peer"
                            />
                            <div className="relative w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                            <span className="ml-2 text-xs text-gray-600">Bounding Boxes</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-4 pt-3">
                      <div className="flex space-x-2 overflow-x-auto p-2 bg-gray-50 border border-gray-200 rounded-lg">
                        {selectedLog.images && selectedLog.images.map((image, index) => {
                          const imageUrl = getImageUrl(image);
                          return imageUrl ? (
                            <div
                              key={index}
                              className={`flex-shrink-0 h-20 w-20 rounded-md cursor-pointer overflow-hidden border-2 transition-all ${selectedImage === imageUrl ? 'border-blue-500 shadow' : 'border-transparent hover:border-gray-300'}`}
                              onClick={() => handleImageSelect(image)}
                            >
                              <img
                                src={imageUrl}
                                alt={`Image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : null;
                        })}
                        {selectedLog.images && selectedLog.images.length > 10 && (
                          <div className="flex-shrink-0 h-16 px-3 bg-gray-100 rounded-md flex items-center justify-center">
                            <span className="text-xs text-gray-600">+{selectedLog.images.length - 10} more</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 p-4 flex flex-col">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                      <div className="flex-1 w-full bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                        {getDisplayImage() ? (
                          <div className="relative w-full h-full flex items-center justify-center">
                            <img
                              ref={imgRefCallback}
                              src={getDisplayImage() || undefined}
                              alt="Preview"
                              className="max-w-full max-h-full object-contain p-2"
                              onLoad={(e) => {
                                // Update image reference when image is loaded
                                if (e.currentTarget) {
                                  setImageRef(e.currentTarget);
                                }
                              }}
                            />
                            {/* Only render DIV-based bounding boxes if we're showing bounding boxes
                                AND the current image doesn't already have annotations */}
                            {showBoundingBoxes && imageRef && getCurrentImageDetections().length > 0 && 
                             getDisplayImage() === selectedImage && (
                              <div 
                                className="absolute pointer-events-none" 
                                style={{
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  width: imageRef?.width || 0,
                                  height: imageRef?.height || 0
                                }}
                              >
                                {getCurrentImageDetections().map((detection, idx) => {
                                  if (!detection.box) {
                                    return null;
                                  }
                                  
                                  const [x, y, width, height] = detection.box;
                                  const style = {
                                    position: 'absolute' as 'absolute',
                                    left: `${x * 100}%`,
                                    top: `${y * 100}%`,
                                    width: `${width * 100}%`,
                                    height: `${height * 100}%`,
                                    border: `2px solid ${getColorForClass(detection.class)}`,
                                    boxSizing: 'border-box' as 'border-box'
                                  };
                                  
                                  return (
                                    <div key={idx} style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}>
                                      <div style={style}>
                                        <div 
                                          className="text-white text-xs px-1 py-0.5 absolute top-0 left-0 transform -translate-y-full"
                                          style={{ backgroundColor: getColorForClass(detection.class) }}
                                        >
                                          {detection.class} {(detection.confidence * 100).toFixed(1)}%
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {showBoundingBoxes && getCurrentImageDetections().length === 0 && (
                              <div className="absolute bottom-2 right-2 bg-yellow-100 text-yellow-800 text-xs p-1.5 rounded">
                                No bounding box data available
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400">No image available</div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-6">
                    <div className="max-w-xs">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-500 font-medium">Select a log to view images</p>
                      <p className="text-gray-400 text-sm mt-1">Choose a log entry from the list to see detected images</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Column 4: Statistics and Description - Takes full width on mobile, 3/12 columns on larger screens */}
              <div className="md:col-span-1 lg:col-span-3 bg-white/95 rounded-lg border border-gray-100 shadow-sm p-4 overflow-y-auto">
                <h3 className="text-base font-semibold text-gray-800 mb-4">Details</h3>
                
                {selectedLog ? (
                  <div className="space-y-5">
                    {/* Description Section */}
                    <div className="bg-white/90 border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                      <div className="flex items-center justify-between p-3 border-b border-gray-100">
                        <h4 className="text-sm font-medium text-gray-700">Description</h4>
                        <button
                          className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                          onClick={(e) => openRenameModal(selectedLog, e)}
                          title="Edit description"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                      <div className="p-3">
                        {selectedLog.description ? (
                          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                            {selectedLog.description}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            No description available. Click the edit icon to add one.
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-white/90 border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                      <h4 className="text-sm font-medium text-gray-700 p-3 border-b border-gray-100">Class Distribution</h4>
                      <div className="p-3">
                        {selectedLog.detections && selectedLog.detections.length > 0 ? (
                          <div className="bg-gray-50/90 p-3 rounded border border-gray-100">
                            <DistributeGraph detections={selectedLog.detections} />
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 py-2 text-center">No data to display</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-white/90 border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                      <h4 className="text-sm font-medium text-gray-700 p-3 border-b border-gray-100">Detection Summary</h4>
                      <div className="p-3">
                        {selectedLog?.detections && selectedLog.detections.length > 0 ? (
                          <div className="grid grid-cols-1 gap-2">
                            {Object.entries(
                              selectedLog.detections.reduce((acc: any, detection) => {
                                acc[detection.class] = (acc[detection.class] || []).concat(detection);
                                return acc;
                              }, {})
                            ).map(([className, detections]: [string, any]) => (
                              <div
                                key={className}
                                className="bg-blue-50 p-2.5 rounded-lg border border-blue-100"
                              >
                                <p className="text-sm font-medium text-gray-800 mb-1.5">{className}</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {detections.map((detection: Detection, idx: number) => (
                                    <span
                                      key={idx}
                                      className="inline-block bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded cursor-pointer hover:bg-blue-200 transition-colors"
                                      title={`Click to view in image ${detection.imageIndex + 1}${
                                        selectedLog.images && 
                                        selectedLog.images[detection.imageIndex] 
                                          ? ` (${getImageFilename(selectedLog.images[detection.imageIndex])})` 
                                          : ''
                                      }`}
                                      onClick={() => handleConfidenceClick(detection)}
                                    >
                                      {(detection.confidence * 100).toFixed(1)}%
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 py-2 text-center">No detections available</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-white/90 border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                      <h4 className="text-sm font-medium text-gray-700 p-3 border-b border-gray-100">Log Info</h4>
                      <div className="p-3 space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">ID:</span>
                          <span className="text-xs text-gray-700 font-mono">{selectedLog.id.substring(0, 8)}...</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">Time:</span>
                          <span className="text-xs text-gray-700">{selectedLog.timestamp}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">Images:</span>
                          <span className="text-xs text-gray-700">{selectedLog.imageCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">Detections:</span>
                          <span className="text-xs text-gray-700">{selectedLog.detections?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 text-gray-500 bg-gray-50/90 rounded-lg border border-gray-100">
                    <p className="font-medium">Select a log to view details</p>
                    <p className="text-sm mt-1 text-gray-400">Description and statistics will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fadeIn p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Confirm Deletion
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {selectedLogsForDeletion.length} selected {selectedLogsForDeletion.length === 1 ? 'log' : 'logs'}? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteLogs}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Rename Modal */}
        {isRenameModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fadeIn p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Edit Log Details
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Log title
                </label>
                <input
                  type="text"
                  value={newLogTitle}
                  onChange={(e) => setNewLogTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a title for this log"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newLogDescription}
                  onChange={(e) => setNewLogDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a description for this log"
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsRenameModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRenameLog}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        <Footer />
      </main>
    </div>
  );
}