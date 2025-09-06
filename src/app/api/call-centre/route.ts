import { NextRequest, NextResponse } from 'next/server';

interface CallRequest {
  sessionId: string;
  customerPhone: string;
  customerName?: string;
  issue: string;
  chatHistory: Array<{
    message: string;
    timestamp: string;
    satisfaction?: 'satisfied' | 'unsatisfied';
  }>;
  urgency: 'low' | 'medium' | 'high';
}

interface CallResponse {
  success: boolean;
  callId: string;
  status: 'initiated' | 'connecting' | 'connected' | 'failed';
  estimatedConnectTime: number;
  agentId?: string;
  message: string;
}

// Simulated call centre phone numbers (in production, use real numbers)
const CALL_CENTRE_NUMBERS = [
  '+27-10-210-0001', // Primary agent
  '+27-10-210-0002', // Secondary agent
  '+27-10-210-0003', // Supervisor
];

export async function POST(request: NextRequest) {
  try {
    const body: CallRequest = await request.json();
    const { sessionId, customerPhone, customerName, issue, chatHistory, urgency } = body;

    if (!sessionId || !customerPhone || !issue) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, customerPhone, issue' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(customerPhone.replace(/[-\s]/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Trigger the phone call
    const callResult = await initiateCallCentreCall({
      sessionId,
      customerPhone,
      customerName,
      issue,
      chatHistory,
      urgency
    });

    return NextResponse.json(callResult);

  } catch (error) {
    console.error('Call centre API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initiate call centre call',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function initiateCallCentreCall(data: CallRequest): Promise<CallResponse> {
  const callId = `CALL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // In production, integrate with actual phone service (Twilio, AWS Connect, etc.)
    const callResponse = await makePhoneCall({
      to: data.customerPhone,
      from: '+27-10-210-0000', // Telkom call centre number
      callId,
      sessionData: {
        sessionId: data.sessionId,
        issue: data.issue,
        chatHistory: data.chatHistory,
        urgency: data.urgency
      }
    });

    // Log the call initiation
    console.log('Call Centre Call Initiated:', {
      callId,
      sessionId: data.sessionId,
      customerPhone: data.customerPhone,
      issue: data.issue,
      urgency: data.urgency,
      timestamp: new Date().toISOString()
    });

    return callResponse;

  } catch (error) {
    console.error('Failed to initiate call:', error);
    return {
      success: false,
      callId,
      status: 'failed',
      estimatedConnectTime: 0,
      message: 'Failed to initiate call. Please try again or contact us directly at +27-10-210-0000'
    };
  }
}

async function makePhoneCall(params: {
  to: string;
  from: string;
  callId: string;
  sessionData: any;
}): Promise<CallResponse> {
  // Simulate phone call API (replace with actual Twilio/AWS Connect integration)
  
  // Example Twilio integration (commented out - requires API keys):
  /*
  const twilio = require('twilio');
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  
  const call = await client.calls.create({
    to: params.to,
    from: params.from,
    url: `${process.env.BASE_URL}/api/call-centre/twiml?sessionId=${params.sessionData.sessionId}`,
    statusCallback: `${process.env.BASE_URL}/api/call-centre/status`,
    statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    timeout: 30,
    record: true
  });
  
  return {
    success: true,
    callId: call.sid,
    status: 'initiated',
    estimatedConnectTime: 15,
    message: 'Call initiated. You should receive a call within 15 seconds.'
  };
  */

  // Simulation for demo purposes - ensure high success rate for testing
  const isSuccessful = Math.random() > 0.02; // 98% success rate
  const connectTime = Math.floor(Math.random() * 15) + 5; // 5-20 seconds

  if (!isSuccessful) {
    throw new Error('Phone service temporarily unavailable');
  }

  // Simulate call to available agent
  const agentId = `AGENT-${Math.floor(Math.random() * 100) + 1}`;
  
  return {
    success: true,
    callId: params.callId,
    status: 'initiated',
    estimatedConnectTime: connectTime,
    agentId,
    message: `Call initiated successfully. You will receive a call from ${params.from} within ${connectTime} seconds. Agent ${agentId} will assist you.`
  };
}

// GET endpoint for checking call status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const callId = searchParams.get('callId');

  if (!callId) {
    return NextResponse.json(
      { error: 'Missing callId parameter' },
      { status: 400 }
    );
  }

  // In production, check actual call status from phone service
  const mockStatus = {
    callId,
    status: 'connected',
    duration: Math.floor(Math.random() * 300) + 60, // 1-5 minutes
    agentId: 'AGENT-42',
    startTime: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
    endTime: null
  };

  return NextResponse.json(mockStatus);
}

// Webhook endpoint for call status updates (for Twilio callbacks)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { callId, status, duration, agentId } = body;

    // Log call status update
    console.log('Call Status Update:', {
      callId,
      status,
      duration,
      agentId,
      timestamp: new Date().toISOString()
    });

    // In production, update database with call status
    // await updateCallStatus(callId, status, duration, agentId);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Call status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update call status' },
      { status: 500 }
    );
  }
}
