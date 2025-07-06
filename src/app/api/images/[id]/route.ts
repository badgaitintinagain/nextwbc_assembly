import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the image ID from params
    const { id } = params;

    if (!id) {
      return new NextResponse('Image ID is required', { status: 400 });
    }

    // Find the image in PredictionImage table
    const image = await prisma.predictionImage.findUnique({
      where: { id },
    });

    if (!image) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // Determine which image data to return (original or annotated)
    const imageData = image.originalImage || image.annotatedImage;
    
    if (!imageData) {
      return new NextResponse('No image data available', { status: 404 });
    }

    // Create response with proper content type
    const response = new NextResponse(Buffer.from(imageData), {
      headers: {
        'Content-Type': image.mimeType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });

    return response;
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
