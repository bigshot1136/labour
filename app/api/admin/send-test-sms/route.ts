import { NextRequest, NextResponse } from 'next/server';
import { msg91Service } from '@/lib/msg91';

// POST handler for sending test SMS
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { phone, message } = body;

    // Validate input
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Send SMS using MSG91 service
    const result = await msg91Service.sendSMS(phone, message);

    // Return response based on result
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test SMS sent successfully',
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send test SMS' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error sending test SMS:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while sending test SMS' },
      { status: 500 }
    );
  }
}