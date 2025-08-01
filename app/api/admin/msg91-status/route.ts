import { NextResponse } from 'next/server';

// GET handler for checking MSG91 configuration status
export async function GET() {
  try {
    // Check if MSG91 environment variables are set
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;
    const senderId = process.env.MSG91_SENDER_ID;

    // Check if all required variables are set
    const isConfigured = !!(authKey && templateId && senderId);

    // Return configuration status
    return NextResponse.json({
      configured: isConfigured,
      // Only include partial auth key for security
      authKey: isConfigured ? `${authKey?.substring(0, 8)}...` : undefined,
      senderId: isConfigured ? senderId : undefined,
    });
  } catch (error) {
    console.error('Error checking Twilio status:', error);
    return NextResponse.json(
      { error: 'Failed to check Twilio configuration status' },
      { status: 500 }
    );
  }
}