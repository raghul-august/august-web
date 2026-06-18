import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { BACKEND_URLS, API_CONFIG, MESSAGE_SOURCE } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, email } = await request.json();
    if (!phoneNumber && !email) {
      return NextResponse.json({ error: 'Phone number or email is required' }, { status: 400 });
    }
    
    const requestBody = phoneNumber
      ? { phoneNumber, source: MESSAGE_SOURCE }
      : { email, source: MESSAGE_SOURCE };

    const response = await axios.post(
      `${BACKEND_URLS.DEFAULT}/c/${API_CONFIG.TENANT}/request-deletion`,
      requestBody
    );

    return NextResponse.json(response.data);
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
    const message = axios.isAxiosError(error)
      ? error.response?.data?.error || error.message
      : 'Failed to request account deletion';
    return NextResponse.json({ error: message }, { status });
  }
}
