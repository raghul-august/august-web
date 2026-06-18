import { NextResponse } from 'next/server';
import { generateQuestionBank } from '@/app/lib/ai/questionBank';

export async function POST(request) {
  try {
    const { slug, lang, contentType } = await request.json();

    if (!slug || !contentType) {
      return NextResponse.json({ success: false, message: 'Missing slug or contentType' }, { status: 400 });
    }

    // Fire-and-forget — don't await
    generateQuestionBank(slug, lang || 'en', contentType).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
