import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma, { handlePrismaQuery } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and an admin
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized access" }),
        {
          status: 403,
          headers: {
            'Cache-Control': 'no-store' // ป้องกัน cache สำหรับ unauthorized
          }
        }
      );
    }

    let users: Array<{
      id: string;
      name: string | null;
      email: string;
      role: string;
      createdAt: Date;
    }> = [];
    
    try {
      // Optimized query with pagination and limited fields using retry logic
      users = await handlePrismaQuery(() => 
        prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 100, // จำกัดจำนวนผลลัพธ์
        })
      ) || [];
    } catch (error) {
      console.error("Prisma error fetching users:", error);
      // Return empty array if database error
      users = [];
    }

    return NextResponse.json({
      users,
      total: users.length
    }, {
      headers: {
        'Cache-Control': 'private, max-age=60', // ลด cache time เป็น 1 นาที
      }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Error fetching users",
        message: error instanceof Error ? error.message : 'Unknown error',
        users: [],
        total: 0
      }),
      {
        status: 500,
      }
    );
  }
}