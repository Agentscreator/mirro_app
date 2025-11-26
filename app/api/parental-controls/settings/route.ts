import { NextRequest, NextResponse } from 'next/server';
import { getParentalControlSettings, updateParentalControlSettings, verifyPinAttempt } from '@/lib/parental-controls';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const pin = searchParams.get('pin');
    
    if (!userId || !pin) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Verify PIN
    const verification = await verifyPinAttempt(userId, pin);
    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error },
        { status: 401 }
      );
    }
    
    const settings = await getParentalControlSettings(userId);
    
    if (!settings) {
      return NextResponse.json(
        { error: 'Parental controls not configured' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, pin, settings } = await request.json();
    
    if (!userId || !pin || !settings) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Verify PIN
    const verification = await verifyPinAttempt(userId, pin);
    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error },
        { status: 401 }
      );
    }
    
    const updatedSettings = await updateParentalControlSettings(userId, settings);
    
    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
