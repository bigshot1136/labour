'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function OTPManagementPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg91Status, setMsg91Status] = useState<{
    configured: boolean;
    authKey?: string;
    senderId?: string;
  }>({ configured: false });

  // Fetch MSG91 configuration status
  useEffect(() => {
    const checkMsg91Config = async () => {
      try {
        const response = await fetch('/api/admin/msg91-status');
        if (response.ok) {
          const data = await response.json();
          setMsg91Status(data);
        }
      } catch (error) {
        console.error('Failed to check MSG91 status:', error);
      }
    };

    checkMsg91Config();
  }, []);

  // Handle sending OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('OTP sent successfully!');
        setMessage(`OTP sent successfully. ${data.otp ? `OTP: ${data.otp}` : ''}`);
      } else {
        toast.error(data.error || 'Failed to send OTP');
        setMessage(`Error: ${data.error || 'Failed to send OTP'}`);
      }
    } catch (error) {
      toast.error('An error occurred while sending OTP');
      setMessage('An error occurred while sending OTP');
    } finally {
      setLoading(false);
    }
  };

  // Handle sending test SMS
  const handleSendTestSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/send-test-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: phoneNumber,
          message: 'This is a test message from Labour Chowk application.'
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Test SMS sent successfully!');
        setMessage(`Test SMS sent successfully. ${data.sid ? `SID: ${data.sid}` : ''}`);
      } else {
        toast.error(data.error || 'Failed to send test SMS');
        setMessage(`Error: ${data.error || 'Failed to send test SMS'}`);
      }
    } catch (error) {
      toast.error('An error occurred while sending test SMS');
      setMessage('An error occurred while sending test SMS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">OTP Management</h1>
      
      {/* MSG91 Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">MSG91 Configuration Status</h2>
        <div className="flex items-center mb-2">
          <div className={`w-3 h-3 rounded-full mr-2 ${msg91Status.configured ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{msg91Status.configured ? 'Configured' : 'Not Configured'}</span>
        </div>
        {msg91Status.configured && (
          <div className="mt-2 text-sm text-gray-600">
            <p>Auth Key: {msg91Status.authKey}</p>
            <p>Sender ID: {msg91Status.senderId}</p>
          </div>
        )}
        {!msg91Status.configured && (
          <div className="mt-2 text-sm text-gray-600">
            <p>MSG91 is not configured. Please check your environment variables:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>MSG91_AUTH_KEY</li>
              <li>MSG91_TEMPLATE_ID</li>
              <li>MSG91_SENDER_ID</li>
            </ul>
          </div>
        )}
      </div>

      {/* OTP Sending Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Send OTP</h2>
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (with country code)
            </label>
            <input
              type="text"
              id="phoneNumber"
              placeholder="+919876543210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
            <button
              type="button"
              onClick={handleSendTestSMS}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Test SMS'}
            </button>
          </div>
        </form>
        {message && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <p>{message}</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <div className="prose">
          <p>To configure MSG91 for OTP sending:</p>
          <ol className="list-decimal ml-5 space-y-2">
            <li>Create a MSG91 account at <a href="https://msg91.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">msg91.com</a></li>
            <li>Get your Auth Key from the MSG91 dashboard</li>
            <li>Create a template for OTP messages and note the Template ID</li>
            <li>Create a Sender ID for your messages</li>
            <li>Update your .env file with the following variables:
              <pre className="bg-gray-100 p-2 rounded mt-1 text-sm">
                MSG91_AUTH_KEY=your_auth_key<br/>
                MSG91_TEMPLATE_ID=your_template_id<br/>
                MSG91_SENDER_ID=your_sender_id
              </pre>
            </li>
            <li>Restart your application</li>
          </ol>
        </div>
      </div>
    </div>
  );
}