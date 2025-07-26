import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma, { handlePrismaQuery } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // ใช้ individual queries แทน Promise.all เพื่อหลีกเลี่ยงปัญหา prepared statement
    let totalUsers = 0;
    let totalPredictions = 0; 
    let recentUsers = 0;

    try {
      // Use retry logic for each query with small delays
      totalUsers = await handlePrismaQuery(() => prisma.user.count()) || 0;
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error counting users:', error);
      totalUsers = 0;
    }

    try {
      totalPredictions = await handlePrismaQuery(() => prisma.predictionLog.count()) || 0;
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error counting predictions:', error);
      totalPredictions = 0;
    }

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      recentUsers = await handlePrismaQuery(() => 
        prisma.user.count({
          where: {
            createdAt: {
              gte: thirtyDaysAgo
            }
          }
        })
      ) || 0;
    } catch (error) {
      console.error('Error counting recent users:', error);
      recentUsers = 0;
    }

    return NextResponse.json({
      totalUsers,
      totalPredictions,
      newUsersThisMonth: recentUsers
    }, {
      headers: {
        'Cache-Control': 'private, max-age=60', // ลด cache time
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch stats',
        totalUsers: 0,
        totalPredictions: 0,
        newUsersThisMonth: 0
      },
      { status: 500 }
    );
  }
}
