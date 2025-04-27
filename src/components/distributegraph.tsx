import { useEffect, useRef, useState } from "react";

// Class Distribution Chart Component
export default function ClassDistributionChart({ detections }) {
    const canvasRef = useRef(null);
    const [chartData, setChartData] = useState(null);
    
    // Process detection data
    useEffect(() => {
        if (!detections || detections.length === 0) return;
        
        // Count occurrences of each class
        const classCounts = {};
        detections.forEach(detection => {
            const className = detection.class;
            classCounts[className] = (classCounts[className] || 0) + 1;
        });
        
        // Transform to array format for chart
        const data = Object.entries(classCounts).map(([className, count]) => ({
            className,
            count: Number(count)
        }));
        
        // Sort by count (descending)
        data.sort((a, b) => b.count - a.count);
        
        setChartData(data);
    }, [detections]);
    
    // Draw chart
    useEffect(() => {
        if (!chartData || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Chart dimensions
        const margin = { top: 20, right: 20, bottom: 50, left: 40 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        
        // Maximum value for scaling
        const maxCount = Math.max(...chartData.map(d => d.count));
        
        // Bar properties
        const barCount = chartData.length;
        const barWidth = Math.min(30, chartWidth / barCount - 10);
        const barSpacing = (chartWidth - barWidth * barCount) / (barCount + 1);
        
        // Chart colors with varying hues (blue palette)
        const colors = chartData.map((_, i) => 
            `hsl(${210 + (i * 15 % 40)}, 70%, ${55 + (i * 5 % 20)}%)`
        );
        
        // Draw axes
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, height - margin.bottom);
        ctx.lineTo(width - margin.right, height - margin.bottom);
        ctx.strokeStyle = '#ccc';
        ctx.stroke();
        
        // Draw bars
        chartData.forEach((item, i) => {
            const x = margin.left + barSpacing + i * (barWidth + barSpacing);
            const barHeight = (item.count / maxCount) * chartHeight;
            const y = height - margin.bottom - barHeight;
            
            // Draw bar
            ctx.fillStyle = colors[i];
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Draw value on top of bar
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(item.count, x + barWidth / 2, y - 5);
            
            // Draw class name below x-axis
            ctx.save();
            ctx.translate(x + barWidth / 2, height - margin.bottom + 10);
            ctx.rotate(Math.PI / 4); // Rotate text for better fit
            ctx.textAlign = 'left';
            ctx.fillText(item.className, 0, 0);
            ctx.restore();
        });
        
        // Draw y-axis title
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.fillText('Count', 0, 0);
        ctx.restore();
        
    }, [chartData]);
    
    return (
        <div className="flex flex-col items-center">
            <canvas 
                ref={canvasRef} 
                width={280} 
                height={200} 
                className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1 text-center">
                Distribution of detected classes
            </p>
        </div>
    );
}