import { NextRequest, NextResponse } from 'next/server';
import { setupPin } from '@/lib/parental-controls';

export async function POST(request: NextRequest) {
  try {
    const { userId, pin, confirmPin } = await request.json();
    
    if (!userId || !pin || !confirmPin) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const result = await setupPin(userId, pin, confirmPin);
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
