import { NextResponse } from 'next/server';
import { sendSlackNotification } from '@/server/slack-notifier';
import logger from '@/utils/logger';

export async function POST(request: Request) {
  if (!process.env.SLACK_TOKEN || !process.env.SLACK_CHANNEL_ID) {
    logger.error('SLACK TOKEN OR CHANNEL NOT CONFIGURED');
    return NextResponse.json(
      { success: false, error: 'Slack configuration missing' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const {
      message = 'Client reported an error',
      context = {},
      pathname,
    } = body || {};

    const textLines = [
      `:rotating_light: *${message}*`,
      pathname ? `• Path: ${pathname}` : null,
      context?.user ? `• User: ${context.user}` : null,
    ].filter(Boolean);

    if (context?.details) {
      textLines.push(
        '```' + JSON.stringify(context.details, null, 2).slice(0, 1900) + '```'
      );
    }

    await sendSlackNotification(
      textLines.join('\n') || ':rotating_light: Error reported'
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('[Slack] Error endpoint failed', {
      errorMessage: (err as Error).message,
    });
    return NextResponse.json(
      { success: false, error: 'Invalid payload' },
      { status: 400 }
    );
  }
}
