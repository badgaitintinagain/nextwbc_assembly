import { useEffect, useState } from "react";

// Types
interface Detection {
    class: string;
    confidence: number;
    imageIndex: number;
    box?: [number, number, number, number];
}

interface CellCounts {
    [key: string]: number;
}

interface CellDistributionTableProps {
    detections?: Detection[];
    allDetections?: Detection[]; // All detections in the log for summary mode
}

// Cell Distribution Table Component
export default function CellDistributionTable({ detections, allDetections }: CellDistributionTableProps) {
    const [cellCounts, setCellCounts] = useState<CellCounts>({});
    const [showSummary, setShowSummary] = useState(false); // Toggle state
    
    // Define all 6 WBC cell types with their colors (matching actual detection classes)
    const cellTypes = [
        { name: 'basophils', displayName: 'Basophils', color: '#FFEAA7' },
        { name: 'eosinophils', displayName: 'Eosinophils', color: '#96CEB4' },
        { name: 'heterophils', displayName: 'Heterophils', color: '#FF6B6B' },
        { name: 'lymphocytes', displayName: 'Lymphocytes', color: '#4ECDC4' },
        { name: 'monocytes', displayName: 'Monocytes', color: '#45B7D1' },
        { name: 'thrombocytes', displayName: 'Thrombocytes', color: '#DDA0DD' }
    ];
    
    // Process detection data
    useEffect(() => {
        // Choose which detections to use based on toggle state
        const dataToProcess = showSummary ? allDetections : detections;
        
        console.log('CellDistributionTable received detections:', dataToProcess); // Debug log
        console.log('Show summary mode:', showSummary); // Debug log
        
        if (!dataToProcess || dataToProcess.length === 0) {
            // Reset all counts to 0 when no detections
            const resetCounts: CellCounts = {};
            cellTypes.forEach(cell => {
                resetCounts[cell.name] = 0;
            });
            setCellCounts(resetCounts);
            console.log('No detections, reset counts:', resetCounts); // Debug log
            return;
        }
        
        // Count occurrences of each class
        const counts: CellCounts = {};
        
        // Initialize all cell types with 0 count
        cellTypes.forEach(cell => {
            counts[cell.name] = 0;
        });
        
        // Count actual detections
        dataToProcess.forEach((detection: Detection) => {
            console.log('Processing detection:', detection); // Debug log
            const className = detection.class;
            if (counts.hasOwnProperty(className)) {
                counts[className] += 1;
                console.log(`Found ${className}, count now: ${counts[className]}`); // Debug log
            } else {
                console.log('Unknown class detected:', className); // Debug log
            }
        });
        
        console.log('Final counts:', counts); // Debug log
        setCellCounts(counts);
    }, [detections, allDetections, showSummary]);
    
    // Calculate total count and percentages
    const totalCount = Object.values(cellCounts).reduce((sum: number, count: number) => sum + count, 0);
    
    return (
        <div className="w-full">
            <div className="bg-black/20 backdrop-blur-sm border border-white/30 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-black/30 backdrop-blur-sm px-3 py-2 border-b border-white/30">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-white drop-shadow-sm">Cell Distribution</h4>
                        
                        {/* Toggle Button */}
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={showSummary}
                                onChange={() => setShowSummary(!showSummary)}
                                className="sr-only peer"
                            />
                            <div className="relative w-8 h-4 bg-black/40 backdrop-blur-sm peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500/80"></div>
                            <span className="ml-1 text-xs text-white drop-shadow-sm">Log Summary</span>
                        </label>
                    </div>
                    
                    {/* Mode indicator */}
                    <div className="mt-1">
                        <span className="text-xs text-white/70 drop-shadow-sm">
                            {showSummary ? 'Showing all cells in this log' : 'Showing cells in current image'}
                        </span>
                    </div>
                </div>
                
                <div className="divide-y divide-white/20">
                    {cellTypes.map((cellType) => {
                        const count = cellCounts[cellType.name] || 0;
                        const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0.0';
                        
                        return (
                            <div key={cellType.name} className="px-3 py-2 hover:bg-black/20 backdrop-blur-sm transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div 
                                            className="w-3 h-3 rounded-full border border-white/30"
                                            style={{ backgroundColor: cellType.color }}
                                        ></div>
                                        <span className="text-xs font-medium text-white drop-shadow-sm">
                                            {cellType.displayName}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs font-bold text-white drop-shadow-sm">
                                            {count}
                                        </span>
                                        <span className="text-xs text-white/70 min-w-[35px] text-right drop-shadow-sm">
                                            ({percentage}%)
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Progress bar */}
                                <div className="mt-1">
                                    <div className="w-full bg-black/40 backdrop-blur-sm h-1.5 rounded-full overflow-hidden border border-white/20">
                                        <div 
                                            className="h-full rounded-full transition-all duration-300"
                                            style={{ 
                                                width: `${percentage}%`,
                                                backgroundColor: cellType.color
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {/* Total summary */}
                <div className="bg-black/30 backdrop-blur-sm px-3 py-2 border-t border-white/30">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-white drop-shadow-sm">Total Cells</span>
                        <span className="text-xs font-bold text-white drop-shadow-sm">{totalCount}</span>
                    </div>
                </div>
            </div>
            
            {totalCount === 0 && (
                <div className="mt-2 text-center">
                    <p className="text-xs text-white/60 drop-shadow-sm">
                        No cells detected in current image
                    </p>
                </div>
            )}
        </div>
    );
}