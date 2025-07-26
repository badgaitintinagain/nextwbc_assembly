import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// GET - ดึงประวัติการทำนายของผู้ใช้ทั้งหมด (สำหรับ admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // ตรวจสอบว่าเป็น admin หรือไม่
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    let whereClause = {};
    if (userId) {
      whereClause = { userId };
    }

    // ดึงข้อมูลการทำนายพร้อมข้อมูลผู้ใช้
    const [predictions, totalCount] = await Promise.all([
      prisma.predictionLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          images: {
            select: {
              id: true,
              filename: true,
              mimeType: true,
              originalImage: true,
              annotatedImage: true
            }
          }
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit
      }),
      prisma.predictionLog.count({ where: whereClause })
    ]);

    // ประมวลผลข้อมูลสำหรับส่งไปยัง frontend
    const processedPredictions = predictions.map(prediction => {
      let detections = [];
      try {
        detections = typeof prediction.detections === 'string' 
          ? JSON.parse(prediction.detections) 
          : prediction.detections || [];
      } catch (error) {
        console.error(`Error parsing detections for prediction ${prediction.id}:`, error);
      }

      // ประมวลผลรูปภาพ
      const processedImages = prediction.images.map(img => ({
        id: img.id,
        filename: img.filename,
        mimeType: img.mimeType,
        originalImage: img.originalImage ? Buffer.from(img.originalImage).toString('base64') : null,
        annotatedImage: img.annotatedImage ? Buffer.from(img.annotatedImage).toString('base64') : null
      }));

      return {
        id: prediction.id,
        timestamp: prediction.timestamp,
        imageCount: prediction.imageCount,
        detections,
        images: processedImages,
        user: prediction.user
      };
    });

    return NextResponse.json({
      predictions: processedPredictions,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching admin predictions:", error);
    return NextResponse.json({ 
      error: "Failed to fetch predictions",
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
