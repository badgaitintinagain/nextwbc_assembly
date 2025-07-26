import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Force disconnect and reconnect Prisma client
    await prisma.$disconnect();
    
    // Wait a moment for the connection to fully close
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test new connection
    await prisma.$connect();
    
    // Verify with a simple query
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      message: "Database connection reset successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database reset error:', error);
    return NextResponse.json({
      error: "Failed to reset database connection",
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
