import axios from 'axios';

// MSG91 configuration
const authKey = process.env.MSG91_AUTH_KEY;
const templateId = process.env.MSG91_TEMPLATE_ID;
const senderId = process.env.MSG91_SENDER_ID;

// Check if MSG91 is configured
const isMSG91Configured = (): boolean => {
  return !!(authKey && templateId && senderId);
};

// Send SMS using MSG91
export const sendSMS = async (to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    if (!isMSG91Configured()) {
      // Fall back to development mode if MSG91 is not configured
      console.log(`📱 [DEV MODE] SMS to ${to}: ${message}`);
      return { success: true };
    }

    // Format phone number (remove + if present)
    const formattedPhone = to.startsWith('+') ? to.substring(1) : to;

    // Prepare the request payload
    const payload = {
      "flow_id": templateId,
      "sender": senderId,
      "recipients": [
        {
          "mobiles": formattedPhone,
          "VAR1": message // Assuming the template has a VAR1 variable for the message
        }
      ]
    };

    // Send SMS via MSG91 API
    const response = await axios.post(
      'https://api.msg91.com/api/v5/flow/',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'authkey': authKey
        }
      }
    );
    
    // Log the full response for debugging
    console.log('MSG91 API Response:', JSON.stringify(response.data, null, 2));

    if (response.data && (response.data.type === 'success' || response.data.type === 'SUCCESS')) {
      // MSG91 returns message ID in the 'message' field
      console.log(`SMS sent to ${to} with ID: ${response.data.message}`);
      return { success: true, messageId: response.data.message };
    } else {
      throw new Error(response.data?.message || 'Unknown error');
    }
  } catch (error: any) {
    console.error('Failed to send SMS via MSG91:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error occurred while sending SMS'
    };
  }
};

// Export MSG91 utility functions
export const msg91Service = {
  isMSG91Configured,
  sendSMS,
};