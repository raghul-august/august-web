import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/utils/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      url,
      channel,
      device_os,
      country,
      message,
      utm,
      phone,
      c,
      meta = {}
    } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Ensure the country code fits within the database column constraint of VARCHAR(2)
    const sanitizedCountry = typeof country === 'string' && country.trim().length <= 2 
      ? country.trim() 
      : null;

    // Merge `c` parameter into the meta JSON object for user attribution tracking
    const finalMeta = {
      ...meta,
      ...(c ? { c } : {})
    };

    // Log request details
    //console.log('Logging redirect:', { url, channel, country, utm, phone });

    const query = `
      INSERT INTO universal_redirect_logs (
        url,
        channel,
        device_os,
        country,
        message,
        utm,
        phone,
        meta
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, accessed_at
    `;

    const result = await executeQuery(query, [
      url,
      channel || null,
      device_os || null,
      sanitizedCountry || null,
      message || null,
      utm || null,
      phone || null,
      finalMeta ? JSON.stringify(finalMeta) : null
    ]);

    console.log("SUCCESS");

    // Return success response with created record ID
    return NextResponse.json({
      success: true,
      id: result[0]?.id,
      accessed_at: result[0]?.accessed_at,
      message: 'Redirect logged successfully'
    }, { status: 201 });

  } catch (error) {
    // Log error details
    console.log('Error logging redirect:', error);

    // Return error response
    return NextResponse.json(
      { error: 'Failed to log redirect' },
      { status: 500 }
    );
  }
}