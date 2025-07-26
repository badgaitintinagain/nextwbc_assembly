import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Count total users
    const userCount = await prisma.user.count();
    
    // Get sample user (without password)
    const sampleUser = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    
    return NextResponse.json({
      status: "success",
      message: "Database connection successful",
      data: {
        userCount,
        sampleUser: sampleUser || "No users found",
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error("Database test error:", error);
    
    return NextResponse.json({
      status: "error",
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
    
  } finally {
    await prisma.$disconnect();
  }
}
