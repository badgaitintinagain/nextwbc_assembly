import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// GET - ดึงสถิติการทำนายของผู้ใช้แต่ละคน (สำหรับ admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // ตรวจสอบว่าเป็น admin หรือไม่
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const resolvedParams = await params;
    const { id: userId } = resolvedParams;

    // ตรวจสอบว่าผู้ใช้นี้มีอยู่จริง
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });
    } catch (error) {
      console.error("Error finding user:", error);
      return NextResponse.json({ error: "Database error when finding user" }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ดึงสถิติการทำนายแบบไม่ใช้ Promise.all เพื่อหลีกเลี่ยง prepared statement conflicts
    let totalPredictions = 0;
    let recentPredictions: any[] = [];

    try {
      // รอสักหน่อยแล้วค่อยทำ query ถัดไป
      await new Promise(resolve => setTimeout(resolve, 100));
      totalPredictions = await prisma.predictionLog.count({
        where: { userId }
      });
    } catch (error) {
      console.error("Error counting predictions:", error);
      totalPredictions = 0;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      recentPredictions = await prisma.predictionLog.findMany({
        where: { userId },
        include: {
          images: {
            select: {
              filename: true,
              mimeType: true,
              annotatedImage: true
            },
            take: 1 // เอาแค่รูปแรก
          }
        },
        orderBy: { timestamp: 'desc' },
        take: 5
      });
    } catch (error) {
      console.error("Error fetching recent predictions:", error);
      recentPredictions = [];
    }

    // คำนวณสถิติเพิ่มเติม
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const lastMonth = new Date(thisMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    let thisMonthCount = 0;
    let lastMonthCount = 0;

    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      thisMonthCount = await prisma.predictionLog.count({
        where: {
          userId,
          timestamp: { gte: thisMonth }
        }
      });
    } catch (error) {
      console.error("Error counting this month predictions:", error);
      thisMonthCount = 0;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      lastMonthCount = await prisma.predictionLog.count({
        where: {
          userId,
          timestamp: {
            gte: lastMonth,
            lt: thisMonth
          }
        }
      });
    } catch (error) {
      console.error("Error counting last month predictions:", error);
      lastMonthCount = 0;
    }

    // คำนวณ growth rate
    const growthRate = lastMonthCount === 0 
      ? (thisMonthCount > 0 ? 100 : 0)
      : ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;

    // ประมวลผลการทำนายล่าสุด
    const processedRecentPredictions = recentPredictions.map(prediction => {
      let detections = [];
      try {
        detections = typeof prediction.detections === 'string' 
          ? JSON.parse(prediction.detections) 
          : prediction.detections || [];
      } catch (error) {
        console.error(`Error parsing detections:`, error);
      }

      return {
        id: prediction.id,
        timestamp: prediction.timestamp,
        imageCount: prediction.imageCount,
        detections,
        thumbnail: prediction.images[0]?.annotatedImage 
          ? `data:${prediction.images[0].mimeType};base64,${Buffer.from(prediction.images[0].annotatedImage).toString('base64')}`
          : null
      };
    });

    return NextResponse.json({
      user,
      stats: {
        totalPredictions,
        thisMonthPredictions: thisMonthCount,
        lastMonthPredictions: lastMonthCount,
        growthRate: Math.round(growthRate * 100) / 100
      },
      recentPredictions: processedRecentPredictions,
      monthlyStats: [] // เพิ่มในอนาคตหากต้องการ
    });

  } catch (error) {
    console.error("Error fetching user prediction stats:", error);
    return NextResponse.json({ 
      error: "Failed to fetch user stats",
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
