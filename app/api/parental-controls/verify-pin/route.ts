import { NextRequest, NextResponse } from 'next/server';
import { verifyPinAttempt } from '@/lib/parental-controls';

export async function POST(request: NextRequest) {
  try {
    const { userId, pin } = await request.json();
    
    if (!userId || !pin) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const result = await verifyPinAttempt(userId, pin);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 401 });
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
