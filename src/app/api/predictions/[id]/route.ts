import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

// PATCH handler for updating a prediction log (like renaming)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the user's session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Find the prediction log
    const predictionLog = await prisma.predictionLog.findUnique({
      where: { id },
    });
    
    if (!predictionLog) {
      return NextResponse.json({ error: 'Prediction log not found' }, { status: 404 });
    }
    
    // Verify that the log belongs to the user
    if (predictionLog.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to update this log' }, { status: 403 });
    }
    
    // Get update data from request body
    const { title, description } = await request.json();
    
    // Update the prediction log
    const updatedLog = await prisma.predictionLog.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
      },
    });
    
    return NextResponse.json(updatedLog);
  } catch (error) {
    console.error('Error updating prediction log:', error);
    return NextResponse.json({ error: 'Failed to update prediction log' }, { status: 500 });
  }
}
