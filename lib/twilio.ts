import twilio from 'twilio';

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client
let twilioClient: twilio.Twilio | null = null;

// Check if Twilio is configured
const isTwilioConfigured = (): boolean => {
  return !!(accountSid && authToken && twilioPhoneNumber);
};

// Get or initialize Twilio client
const getTwilioClient = (): twilio.Twilio | null => {
  if (!isTwilioConfigured()) {
    console.warn('Twilio is not configured. Check your environment variables.');
    return null;
  }

  if (!twilioClient) {
    twilioClient = twilio(accountSid!, authToken!);
  }

  return twilioClient;
};

// Send SMS using Twilio
export const sendSMS = async (to: string, message: string): Promise<{ success: boolean; sid?: string; error?: string }> => {
  try {
    const client = getTwilioClient();
    
    if (!client) {
      // Fall back to development mode if Twilio is not configured
      console.log(`📱 [DEV MODE] SMS to ${to}: ${message}`);
      return { success: true };
    }

    // Format phone number to E.164 format if not already
    const formattedPhone = to.startsWith('+') ? to : `+${to}`;

    // Send SMS via Twilio
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedPhone,
    });

    console.log(`SMS sent to ${to} with SID: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error: any) {
    console.error('Failed to send SMS via Twilio:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error occurred while sending SMS'
    };
  }
};

// Export Twilio utility functions
export const twilioService = {
  isTwilioConfigured,
  sendSMS,
};