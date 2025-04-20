import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fix: Pass authOptions correctly according to next-auth's expected type
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and an admin
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized access" }),
        {
          status: 403,
        }
      );
    }

    // Only an admin can fetch all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return new NextResponse(
      JSON.stringify({ error: "Error fetching users" }),
      {
        status: 500,
      }
    );
  }
}