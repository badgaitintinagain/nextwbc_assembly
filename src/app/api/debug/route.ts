import prisma from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test database connection
    const usersCount = await prisma.user.count();
    
    return NextResponse.json({
      status: "online",
      usersCount,
      message: "Database connection successful"
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json({
      status: "error",
      message: "Database connection failed",
      error: (error as Error).message
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Check if this is a test endpoint in development
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({
        message: "This endpoint is only available in development mode"
      }, { status: 403 });
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({
        message: "Test user already exists",
        userExists: true
      });
    }

    // Create test user with known password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    return NextResponse.json({
      message: "Test user created successfully",
      userId: user.id
    });
  } catch (error) {
    console.error("Error creating test user:", error);
    return NextResponse.json({
      message: "Failed to create test user",
      error: (error as Error).message
    }, { status: 500 });
  }
}
