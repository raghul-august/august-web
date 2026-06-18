import { NextResponse } from 'next/server';
import { query } from '../../lib/db';
const logger = require('../../utils/logger');

// 👇 Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Better to use specific domain
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET() {
  try {
    const { rows } = await query(
      'SELECT code, name_in_local_script FROM languages ORDER BY name_in_local_script'
    );

    return new NextResponse(JSON.stringify(rows), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    logger.error('Database error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    return new NextResponse(
      JSON.stringify({ error: `Database error: ${error.message}` }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

// 👇 Handle preflight OPTIONS request (important!)
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
