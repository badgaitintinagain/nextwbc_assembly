import { NextResponse } from "next/server";

// Ultra-minimal API สำหรับทดสอบ - ไม่ใช้ database เลย
export async function POST(request: Request) {
  console.log("🔍 [MINIMAL API] POST /api/predictions/minimal started");
  
  try {
    console.log("🔍 [MINIMAL API] Parsing form data...");
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const detectionsString = formData.get('detections') as string;
    
    console.log("🔍 [MINIMAL API] Files count:", files.length);
    console.log("🔍 [MINIMAL API] Detections string length:", detectionsString?.length || 0);
    
    let detections;
    try {
      detections = JSON.parse(detectionsString);
      console.log("🔍 [MINIMAL API] Parsed detections:", detections.length);
    } catch (parseError) {
      console.error("❌ [MINIMAL API] Error parsing detections:", parseError);
      return NextResponse.json({ error: "Invalid detections format" }, { status: 400 });
    }
    
    // จำลองการบันทึก - ไม่ใช้ database
    console.log("✅ [MINIMAL API] Simulated save successful");
    
    return NextResponse.json({ 
      success: true, 
      predictionId: "minimal-" + Date.now(),
      message: "Prediction logged (no database save)"
    }, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
    
  } catch (error) {
    console.error("❌ [MINIMAL API] Error:", error);
    return NextResponse.json({ 
      error: "Failed to process prediction", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
