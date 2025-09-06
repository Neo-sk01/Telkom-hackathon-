import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body
    const body = await request.json();
    const { text, n8nWebhookUrl } = body;

    // Validate required fields
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!n8nWebhookUrl) {
      return NextResponse.json(
        { error: 'n8n webhook URL is required' },
        { status: 400 }
      );
    }

    // Prepare the payload to send to n8n
    const payload = {
      text: text,
      timestamp: new Date().toISOString(),
      source: 'telkom-webhook',
      metadata: {
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        requestId: crypto.randomUUID()
      }
    };

    // Send the data to n8n webhook
    const n8nResponse = await fetch("https://khvvtso.app.n8n.cloud/webhook-test/9b5f7142-0410-4e8d-ad62-f8d63fd39052", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Telkom-Webhook/1.0'
      },
      body: JSON.stringify(payload)
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text().catch(() => 'No error details');
      const errorDetails = {
        status: n8nResponse.status,
        statusText: n8nResponse.statusText,
        url: n8nWebhookUrl,
        response: errorText
      };
      
      let troubleshootingTip = '';
      if (n8nResponse.status === 404) {
        troubleshootingTip = 'Webhook not found. Check: 1) Workflow is activated, 2) URL is correct, 3) Using production URL (not test URL)';
      } else if (n8nResponse.status === 405) {
        troubleshootingTip = 'Method not allowed. Ensure webhook node accepts POST requests';
      } else if (n8nResponse.status === 401 || n8nResponse.status === 403) {
        troubleshootingTip = 'Authentication error. Check webhook authentication settings';
      }
      
      throw new Error(`n8n webhook failed: ${JSON.stringify(errorDetails)}${troubleshootingTip ? ` | Tip: ${troubleshootingTip}` : ''}`);
    }

    const n8nResult = await n8nResponse.json().catch(() => ({}));

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Text sent to n8n successfully',
      data: {
        sentText: text,
        timestamp: payload.timestamp,
        requestId: payload.metadata.requestId,
        n8nResponse: n8nResult
      }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send text to n8n',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Telkom Webhook Endpoint',
    description: 'Send POST requests with text to forward to n8n',
    usage: {
      method: 'POST',
      endpoint: '/api/webhook',
      body: {
        text: 'Your message text',
        n8nWebhookUrl: 'https://khvvtso.app.n8n.cloud/webhook-test/9b5f7142-0410-4e8d-ad62-f8d63fd39052'
      }
    },
    example: {
      curl: `curl -X POST ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhook \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Hello from Telkom webhook!",
    "n8nWebhookUrl": "https://your-n8n-instance.com/webhook/your-webhook-id"
  }'`
    }
  });
}
