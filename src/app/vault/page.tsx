"use client"
import CellDistributionTable from "@/components/distributegraph";
import Header from "@/components/header";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Detection {
  class: string;
  confidence: number;
  imageIndex: number;
  box?: [number, number, number, number]; // Add box property for bounding box coordinates
}

interface ImageData {
  id?: string;
  originalImage?: string;
  annotatedImage?: string;
  mimeType?: string;
  filename?: string;
  url?: string;
  src?: string;
  path?: string;
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
  // Authentication check
  const { data: session, status } = useSession();
  const router = useRouter();

  // State สำหรับ logs, selected log และ image
  const [logs, setLogs] = useState<Log[]>([]);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);

  // Add state for log management
  const [selectedLogsForDeletion, setSelectedLogsForDeletion] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [logToRename, setLogToRename] = useState<Log | null>(null);
  const [newLogTitle, setNewLogTitle] = useState('');
  const [newLogDescription, setNewLogDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Authentication check effect
  useEffect(() => {
    if (status === "loading") return; // Still loading session
    
    if (status === "unauthenticated") {
      // Redirect to sign-in page with callback URL
      router.push(`/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
      return;
    }
  }, [status, router]);

  // ดึงข้อมูล logs จาก database
  useEffect(() => {
    const fetchLogs = async () => {
      // Only fetch if authenticated
      if (status !== "authenticated" || !session) {
        return;
      }

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
        const processedLogs = data.map((log: Record<string, unknown>) => {
          try {
            return {
              id: (log.id as string) || `temp-${Date.now()}-${Math.random()}`,
              userId: (log.userId as string) || 'unknown',
              timestamp: (log.timestamp as string) ? new Date(log.timestamp as string).toLocaleString() : new Date().toLocaleString(),
              imageCount: (log.imageCount as number) || (Array.isArray(log.images) ? (log.images as unknown[]).length : 0),
              title: (log.title as string) || '', // Include the title if available
              description: (log.description as string) || '', // Include the description if available
              // Ensure images are properly processed
              images: Array.isArray(log.images) 
                ? (log.images as Record<string, unknown>[]).map((img) => ({
                    id: (img.id as string) || `img-${Date.now()}-${Math.random()}`,
                    originalImage: (img.originalImage as string) || undefined,
                    annotatedImage: (img.annotatedImage as string) || undefined,
                    mimeType: (img.mimeType as string) || 'image/jpeg',
                    filename: (img.filename as string) || 'image.jpg'
                  }))
                : [],
              detections: Array.isArray(log.detections) ? (log.detections as Detection[]) : []
            };
          } catch (err) {
            console.error('Error processing log entry:', err, log);
            // Return a minimal valid log entry if processing fails
            return {
              id: (log.id as string) || `error-${Date.now()}`,
              userId: 'error',
              timestamp: new Date().toLocaleString(),
              imageCount: 0,
              images: [],
              detections: []
            };
          }
        });
        
        console.log('Processed logs:', processedLogs); // Debug log to inspect processed data
        
        // Additional debug for the first log
        if (processedLogs.length > 0) {
          console.log('First log details:', processedLogs[0]);
          console.log('First log detections:', processedLogs[0].detections);
          console.log('First log images:', processedLogs[0].images);
        }
        
        setLogs(processedLogs);
        setError(null);
      } catch (err: unknown) {
        console.error('Error fetching prediction logs:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setLogs([]); // Ensure logs is always an array even on error
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLogs();
  }, [session, status]); // เพิ่ม session และ status เป็น dependencies

  // Show loading screen while checking authentication
  if (status === "loading") {
    return (
      <div className="relative flex flex-col min-h-screen w-full bg-black overflow-hidden">
        {/* Background video */}
        <div className="absolute inset-0 z-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            className="absolute top-0 left-0 w-full h-full object-cover blur-md brightness-50"
            style={{ transform: 'scale(1.1)' }} // Slight scale to ensure no gaps
          >
            <source src="/shortvid/gradient_loop.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Semi-transparent overlay */}
        <div className="absolute inset-0 z-10 bg-black/30 backdrop-blur-md w-full h-full"></div>

        {/* Loading content */}
        <main className="relative z-20 flex flex-col h-screen pt-16">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl shadow-2xl p-8 text-center">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg font-medium">Loading...</p>
              <p className="text-white/80 text-sm mt-2">Checking authentication</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Don't render main content if not authenticated (will redirect)
  if (status === "unauthenticated") {
    return null;
  }

  // Helper function to get image URL from potentially object data
  const getImageUrl = (imageData: unknown): string | null => {
    if (!imageData) return null;
    
    try {
      // Handle string URLs directly (legacy data or already processed)
      if (typeof imageData === 'string') return imageData;
      
      // Handle database image objects
      if (typeof imageData === 'object' && imageData !== null) {
        const imgData = imageData as ImageData;
        // If it's a database image object with original or annotated image data
        if (imgData.originalImage) {
          return `data:${imgData.mimeType || 'image/jpeg'};base64,${imgData.originalImage}`;
        }
        if (imgData.annotatedImage) {
          return `data:${imgData.mimeType || 'image/jpeg'};base64,${imgData.annotatedImage}`;
        }
        
        // Legacy format handling
        if (imgData.url) return imgData.url;
        if (imgData.src) return imgData.src;
        if (imgData.path) return imgData.path;
      }
    } catch (err) {
      console.error('Error getting image URL:', err, imageData);
    }
    return null;
  };
  
  // Helper function to extract filename from image data
  const getImageFilename = (imageData: unknown): string => {
    if (!imageData) return 'Unknown';
    
    // If imageData is an object with a filename property
    if (typeof imageData === 'object' && imageData !== null) {
      const imgData = imageData as ImageData;
      if (imgData.filename) {
        return imgData.filename;
      }
    }
    
    // Otherwise try to extract from URL
    const url = getImageUrl(imageData);
    if (!url) return 'Unknown';
    if (url.startsWith('data:')) return 'Image'; // Data URLs don't have filenames
    
    try {
      return url.split('/').pop() || 'Unknown';
    } catch {
      return 'Unknown';
    }
  };

  // เลือก log
  const handleLogSelect = (log: Log) => {
    console.log('handleLogSelect called with log:', log); // Debug log
    setSelectedLog(log);
    const firstImageUrl = log.images && log.images.length > 0 ? getImageUrl(log.images[0]) : null;
    console.log('Setting selectedImage to:', firstImageUrl); // Debug log
    setSelectedImage(firstImageUrl);
  };

  // เลือกรูปภาพจาก log
  const handleImageSelect = (image: unknown) => {
    const imageUrl = getImageUrl(image);
    console.log('handleImageSelect called with image:', image); // Debug log
    console.log('Setting selectedImage to:', imageUrl); // Debug log
    setSelectedImage(imageUrl);
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
    console.log('getCurrentImageDetections called'); // Debug log
    console.log('selectedLog?.detections:', selectedLog?.detections); // Debug log
    console.log('selectedLog?.images:', selectedLog?.images); // Debug log
    console.log('selectedImage:', selectedImage); // Debug log
    
    if (!selectedLog?.detections || !selectedLog?.images) {
      console.log('No detections or images, returning empty array'); // Debug log
      return [];
    }
    
    const currentImageIndex = selectedLog.images.findIndex(img => 
      getImageUrl(img) === selectedImage
    );
    
    console.log('currentImageIndex:', currentImageIndex); // Debug log
    
    if (currentImageIndex >= 0) {
      const filteredDetections = selectedLog.detections.filter(detection => 
        detection.imageIndex === currentImageIndex
      );
      console.log('filteredDetections:', filteredDetections); // Debug log
      return filteredDetections;
    }
    
    console.log('No matching image index, returning empty array'); // Debug log
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
          ids: selectedLogsForDeletion // แก้จาก logIds เป็น ids
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
      
      const updatedLogData = await response.json();
      
      // Update the log in state
      setLogs(prevLogs => prevLogs.map(log => 
        log.id === logToRename.id 
          ? { ...log, title: updatedLogData.title, description: updatedLogData.description }
          : log
      ));
      
      // Update selected log if it's the one being edited
      if (selectedLog && selectedLog.id === logToRename.id) {
        setSelectedLog(prev => prev ? { ...prev, title: updatedLogData.title, description: updatedLogData.description } : null);
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
    <div className="relative flex flex-col min-h-screen w-full bg-black overflow-hidden">
      {/* Background video */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          className="absolute top-0 left-0 w-full h-full object-cover blur-md brightness-50"
          style={{ transform: 'scale(1.1)' }} // Slight scale to ensure no gaps
        >
          <source src="/shortvid/gradient_loop.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 z-10 bg-black/30 backdrop-blur-md w-full h-full"></div>

      {/* main content */}
      <main className="relative z-20 flex flex-col h-screen pt-16">
        <Header />
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-4 overflow-auto lg:overflow-hidden lg:h-full lg:flex lg:flex-col">
          {/* Subtle decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-15 pointer-events-none">
            <div className="absolute top-12 left-12 w-20 h-20 bg-gradient-to-br from-white/25 to-transparent rounded-full blur-md"></div>
            <div className="absolute bottom-16 right-14 w-16 h-16 bg-gradient-to-tl from-white/20 to-transparent rounded-full blur-md"></div>
            <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-gradient-to-r from-white/15 to-transparent rounded-full blur-sm"></div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-2xl p-4 min-h-full lg:flex-1 lg:flex lg:flex-col lg:min-h-0 relative" style={{
            backdropFilter: 'blur(15px)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
          }}>
            {/* Header gradient line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-t-3xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 lg:flex-1 lg:h-full relative z-10">
              {/* Column 1: Log List - Takes full width on mobile, 3/12 columns on larger screens */}
              <div className="lg:col-span-3 bg-white border border-gray-300 rounded-xl lg:rounded-l-2xl shadow-lg flex flex-col h-80 lg:h-full overflow-hidden">
                <div className="flex items-center justify-between p-3 border-b border-gray-300 flex-shrink-0 bg-gray-50 rounded-t-xl">
                  <h3 className="text-sm font-semibold text-gray-800 drop-shadow-sm">Prediction Logs</h3>
                  <div className="flex space-x-1">
                    {/* Edit mode toggle button */}
                    <button
                      className={`text-xs px-2 py-1 rounded-md transition-all ${
                        isEditing 
                          ? 'bg-blue-500 text-white font-medium border border-blue-400' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300'
                      }`}
                      onClick={toggleEditMode}
                    >
                      {isEditing ? 'Done' : 'Edit'}
                    </button>
                    
                    {/* Delete button - only shown in edit mode */}
                    {isEditing && (
                      <button
                        className={`text-xs px-2 py-1 rounded-md transition-all ${
                          selectedLogsForDeletion.length > 0
                            ? 'bg-red-500 text-white hover:bg-red-600 font-medium border border-red-400'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
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
                
                <div className="flex-1 overflow-y-auto p-2">
                  {logs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center p-4 text-gray-700">
                      {isLoading ? (
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mb-2"></div>
                          <p className="text-sm drop-shadow-sm">Loading...</p>
                        </div>
                      ) : error ? (
                        <div>
                          <p className="font-medium text-sm drop-shadow-sm">Error Loading Data</p>
                          <p className="text-xs mt-1 text-red-600 drop-shadow-sm">{error}</p>
                        </div>
                      ) : (
                        <div className="space-y-0 h-full p-2">
                          <p className="font-medium text-sm drop-shadow-sm">No Prediction History</p>
                          <p className="text-xs mt-1 text-gray-500 drop-shadow-sm">Create a new prediction to see results here</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className={`bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-2 hover:shadow-lg hover:border-gray-300 hover:bg-gray-100 transition-all cursor-pointer flex items-center gap-2 group hover:scale-[1.02] ${
                            selectedLog?.id === log.id ? 'ring-2 ring-blue-400 border-blue-300 shadow-lg bg-blue-50' : ''
                          }`}
                          onClick={() => !isEditing && handleLogSelect(log)}
                        >
                          {/* Checkbox for selection in edit mode */}
                          {isEditing && (
                            <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedLogsForDeletion.includes(log.id)}
                                onChange={(e) => toggleLogSelection(log.id, e as unknown as React.MouseEvent)}
                                className="w-3 h-3 text-blue-500 bg-white border-gray-300 rounded focus:ring-blue-400 focus:ring-2"
                              />
                            </div>
                          )}
                          <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-lg overflow-hidden border border-gray-300 group-hover:border-gray-400 transition-colors">
                            {log.images && log.images[0] ? (
                              <img
                                src={getImageUrl(log.images[0]) || undefined}
                                alt="First image"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-xs text-gray-500 drop-shadow-sm">No image</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                            <p className="text-sm text-gray-800 font-semibold truncate drop-shadow-sm">
                              {log.title || `Log ${log.timestamp}`}
                            </p>
                            <p className="text-xs text-gray-500 truncate drop-shadow-sm">{log.timestamp}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-700 drop-shadow-sm rounded-full border border-gray-300">
                                {log.imageCount} images
                              </span>
                              {log.detections && log.detections.length > 0 && (
                                <span className="text-xs px-1.5 py-0.5 bg-blue-500 text-white rounded-full border border-blue-400 drop-shadow-sm">
                                  {log.detections.length} detections
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Columns 2-3: Image Preview - Takes full width on mobile, 6/12 columns on larger screens */}
              <div className="lg:col-span-6 bg-white border border-gray-300 rounded-xl shadow-lg flex flex-col h-80 lg:h-full overflow-hidden relative">
                {selectedLog ? (
                  <div className="h-full flex flex-col relative z-10">
                    {/* Header */}
                    <div className="p-2 lg:p-3 border-b border-gray-300 flex-shrink-0 bg-gray-50 rounded-t-xl">
                      <div className="flex items-center justify-between mb-1 lg:mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-800 truncate drop-shadow-sm">
                            {selectedLog.title || selectedLog.timestamp}
                          </h3>
                          <div className="lg:hidden mt-1">
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={showBoundingBoxes}
                                onChange={toggleBoundingBoxes}
                                className="sr-only peer"
                              />
                              <div className="relative w-8 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"></div>
                              <span className="ml-1 text-xs text-gray-700 drop-shadow-sm">Bounding Boxes</span>
                            </label>
                          </div>
                        </div>
                        {/* Edit button with pencil icon */}
                        <button
                          className="text-gray-500 hover:text-blue-500 transition-colors p-1 flex-shrink-0 hover:scale-110 group"
                          onClick={(e) => openRenameModal(selectedLog, e)}
                          title="Edit title and description"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="hidden lg:flex items-center">
                        <div className="ml-auto">
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={showBoundingBoxes}
                              onChange={toggleBoundingBoxes}
                              className="sr-only peer"
                            />
                            <div className="relative w-8 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"></div>
                            <span className="ml-1 text-xs text-gray-700 drop-shadow-sm">Bounding Boxes</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Preview - PredictDemo style with background image */}
                    <div className="flex-1 p-2 flex flex-col min-h-0">
                      <div className="flex-1 w-full bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-300 min-h-0 relative shadow-xl">
                        {/* Background image with liquid glass effect */}
                        {getDisplayImage() && (
                          <div className="absolute inset-0">
                            <img
                              src={getDisplayImage() || undefined}
                              alt="Background"
                              className="w-full h-full object-cover opacity-40 blur-xl scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/40 backdrop-blur-xs"></div>
                          </div>
                        )}
                        
                        {getDisplayImage() ? (
                          <div className="relative w-full h-full flex items-center justify-center z-10">
                            <img
                              ref={imgRefCallback}
                              src={getDisplayImage() || undefined}
                              alt="Preview"
                              className="w-full h-full object-contain drop-shadow-2xl"
                              onLoad={(e) => {
                                // Update image reference when image is loaded
                                if (e.currentTarget) {
                                  setImageRef(e.currentTarget);
                                }
                              }}
                            />
                            {/* Results overlay with glass effect similar to PredictDemo */}
                            {selectedLog.detections && selectedLog.detections.length > 0 && (
                              <div className="absolute bottom-0 left-0 right-0 bg-white/95 text-gray-800 p-3 text-sm rounded-b-2xl z-20 border-t border-gray-300">
                                <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <p className="drop-shadow-sm">
                                    <span className="text-green-600 font-medium">Total Detections:</span> {selectedLog.detections.length} objects found
                                  </p>
                                </div>
                              </div>
                            )}
                            
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
                                    position: 'absolute' as const,
                                    left: `${x * 100}%`,
                                    top: `${y * 100}%`,
                                    width: `${width * 100}%`,
                                    height: `${height * 100}%`,
                                    border: `2px solid ${getColorForClass(detection.class)}`,
                                    boxSizing: 'border-box' as const
                                  };
                                  
                                  return (
                                    <div key={idx} style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}>
                                      <div style={style}>
                                        <div 
                                          className="text-white text-xs px-1 py-0.5 absolute top-0 left-0 transform -translate-y-full drop-shadow-md"
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
                              <div className="absolute bottom-4 right-4 bg-yellow-100 text-yellow-700 text-xs p-2 rounded-lg border border-yellow-300 drop-shadow-lg">
                                No bounding box data available
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center w-full h-full z-10 relative">
                            <div className="relative text-center">
                              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                              </svg>
                              <p className="text-gray-800 drop-shadow-sm font-medium">No image available</p>
                              <p className="text-gray-500 text-sm mt-1 drop-shadow-sm">Select an image from the tray below</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Image Tray - PredictDemo style at bottom */}
                        {selectedLog.images && selectedLog.images.length > 0 && (
                          <div className="absolute inset-x-0 bottom-4 z-30 flex justify-center pointer-events-none">
                            <div className="flex justify-center gap-2 px-3 py-2 bg-white/95 rounded-2xl shadow-2xl min-h-[44px] border border-gray-300 pointer-events-auto animate-slideDown" style={{
                              maxWidth: '90%'
                            }}>
                              {selectedLog.images.map((image, index) => {
                                const imageUrl = getImageUrl(image);
                                return imageUrl ? (
                                  <div
                                    key={index}
                                    className={`h-10 w-10 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-110 ${
                                      selectedImage === imageUrl 
                                        ? 'ring-2 ring-blue-400 shadow-lg scale-105' 
                                        : 'border border-gray-300 hover:border-gray-400 shadow-md hover:shadow-lg'
                                    }`}
                                    onClick={() => handleImageSelect(image)}
                                  >
                                    <img
                                      src={imageUrl}
                                      alt={`Thumb ${index}`}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-4 relative z-10">
                    <div className="max-w-xs">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-800 drop-shadow-sm font-medium text-sm">Select a log to view images</p>
                      <p className="text-gray-500 text-xs mt-1 drop-shadow-sm">Choose a log entry from the list to see detected images</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Column 4: Statistics and Description - Takes full width on mobile, 3/12 columns on larger screens */}
              <div className="lg:col-span-3 bg-white border border-gray-300 rounded-xl lg:rounded-r-2xl shadow-lg flex flex-col h-80 lg:h-full overflow-hidden">
                <div className="p-3 border-b border-gray-300 flex-shrink-0 bg-gray-50 rounded-t-xl">
                  <h3 className="text-sm font-semibold text-gray-800 drop-shadow-sm">Details</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 relative z-10">
                  {selectedLog ? (
                    <div className="space-y-3">
                      {/* Description Section */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                        <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-100">
                          <h4 className="text-xs font-medium text-gray-800 drop-shadow-sm">Description</h4>
                          <button
                            className="text-gray-500 hover:text-blue-500 transition-colors p-1 hover:scale-110 group"
                            onClick={(e) => openRenameModal(selectedLog, e)}
                            title="Edit description"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>
                        <div className="p-2">
                          {selectedLog.description ? (
                            <p className="text-xs text-gray-700 drop-shadow-sm whitespace-pre-line leading-relaxed">
                              {selectedLog.description}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500 italic drop-shadow-sm">
                              No description available. Click the edit icon to add one.
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                        <h4 className="text-xs font-medium text-gray-800 drop-shadow-sm p-2 border-b border-gray-200 bg-gray-100">Class Distribution</h4>
                        <div className="p-2">
                          {selectedLog.detections && selectedLog.detections.length > 0 ? (
                            <CellDistributionTable 
                              detections={getCurrentImageDetections()} 
                              allDetections={selectedLog.detections}
                            />
                          ) : (
                            <p className="text-xs text-gray-500 py-1 text-center drop-shadow-sm">No data to display</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                        <h4 className="text-xs font-medium text-gray-800 drop-shadow-sm p-2 border-b border-gray-200 bg-gray-100">Detection Summary</h4>
                        <div className="p-2">
                          {selectedLog?.detections && selectedLog.detections.length > 0 ? (
                            <div className="grid grid-cols-1 gap-1.5">
                              {Object.entries(
                                selectedLog.detections.reduce((acc: Record<string, Detection[]>, detection) => {
                                  acc[detection.class] = (acc[detection.class] || []).concat(detection);
                                  return acc;
                                }, {})
                              ).map(([className, detections]: [string, Detection[]]) => (
                                <div
                                  key={className}
                                  className="bg-blue-100 p-2 rounded border border-blue-200 shadow-sm"
                                >
                                  <p className="text-xs font-medium text-blue-800 drop-shadow-sm mb-1">{className}</p>
                                  <div className="flex flex-wrap gap-1">
                                    {detections.map((detection: Detection, idx: number) => (
                                      <span
                                        key={idx}
                                        className="inline-block bg-blue-200 text-blue-800 text-xs px-1 py-0.5 rounded cursor-pointer hover:bg-blue-300 transition-colors border border-blue-300 hover:scale-105"
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
                            <p className="text-xs text-gray-500 py-1 text-center drop-shadow-sm">No detections available</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                        <h4 className="text-xs font-medium text-gray-800 drop-shadow-sm p-2 border-b border-gray-200 bg-gray-100">Log Info</h4>
                        <div className="p-2 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500 drop-shadow-sm">ID:</span>
                            <span className="text-xs text-gray-800 drop-shadow-sm font-mono">{selectedLog.id.substring(0, 8)}...</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500 drop-shadow-sm">Time:</span>
                            <span className="text-xs text-gray-800 drop-shadow-sm">{selectedLog.timestamp}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500 drop-shadow-sm">Images:</span>
                            <span className="text-xs text-gray-800 drop-shadow-sm">{selectedLog.imageCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500 drop-shadow-sm">Detections:</span>
                            <span className="text-xs text-gray-800 drop-shadow-sm">{selectedLog.detections?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 shadow-lg">
                      <p className="font-medium text-sm drop-shadow-sm">Select a log to view details</p>
                      <p className="text-xs mt-1 text-gray-500 drop-shadow-sm">Description and statistics will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-gray-300 rounded-lg shadow-xl w-full max-w-md relative animate-fadeIn p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4 drop-shadow-sm">
                Confirm Deletion
              </h2>
              <p className="text-gray-700 drop-shadow-sm mb-6">
                Are you sure you want to delete {selectedLogsForDeletion.length} selected {selectedLogsForDeletion.length === 1 ? 'log' : 'logs'}? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 drop-shadow-sm rounded hover:bg-gray-300 transition-colors border border-gray-300 hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteLogs}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors border border-red-400 hover:scale-105 drop-shadow-sm"
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-gray-300 rounded-lg shadow-xl w-full max-w-md relative animate-fadeIn p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4 drop-shadow-sm">
                Edit Log Details
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 drop-shadow-sm mb-1">
                  Log title
                </label>
                <input
                  type="text"
                  value={newLogTitle}
                  onChange={(e) => setNewLogTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-400 drop-shadow-sm"
                  placeholder="Enter a title for this log"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 drop-shadow-sm mb-1">
                  Description
                </label>
                <textarea
                  value={newLogDescription}
                  onChange={(e) => setNewLogDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-400 drop-shadow-sm"
                  placeholder="Enter a description for this log"
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsRenameModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 drop-shadow-sm rounded hover:bg-gray-300 transition-colors border border-gray-300 hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRenameLog}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors border border-blue-400 hover:scale-105 drop-shadow-sm"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
        
      </main>
    </div>
  );
}