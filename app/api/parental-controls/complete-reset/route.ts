import { NextRequest, NextResponse } from 'next/server';
import { completePinReset } from '@/lib/parental-controls';

export async function POST(request: NextRequest) {
  try {
    const { token, newPin, confirmPin } = await request.json();
    
    if (!token || !newPin || !confirmPin) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const result = await completePinReset(token, newPin, confirmPin);
    
    // TODO: Send confirmation email to guardian
    
    return NextResponse.json({
      success: true,
      message: 'PIN has been reset successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
