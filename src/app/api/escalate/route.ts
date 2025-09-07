import { NextRequest, NextResponse } from 'next/server';

interface EscalationRequest {
  sessionId: string;
  userId?: string;
  reason: string;
  chatHistory: Array<{
    message: string;
    timestamp: string;
    satisfaction?: 'satisfied' | 'unsatisfied';
  }>;
}

interface CallCentreResponse {
  success: boolean;
  ticketId: string;
  estimatedWaitTime: number;
  agentAvailable: boolean;
  callbackNumber?: string;
}

// In-memory storage for session tracking (in production, use a database)
const sessionAttempts = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    const body: EscalationRequest = await request.json();
    const { sessionId, userId, reason, chatHistory } = body;

    if (!sessionId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, reason' },
        { status: 400 }
      );
    }

    // Count unsatisfied responses in chat history
    const unsatisfiedCount = chatHistory.filter(
      chat => chat.satisfaction === 'unsatisfied'
    ).length;

    // Update session attempts
    const currentAttempts = sessionAttempts.get(sessionId) || 0;
    const totalAttempts = Math.max(currentAttempts, unsatisfiedCount);
    sessionAttempts.set(sessionId, totalAttempts);

    // Check if escalation threshold is met
    if (totalAttempts < 3) {
      return NextResponse.json({
        escalate: false,
        attemptsRemaining: 3 - totalAttempts,
        message: `We're sorry the AI assistant hasn't fully resolved your issue. You have ${3 - totalAttempts} more attempt(s) before we connect you with a human agent.`
      });
    }

    // Trigger escalation to call centre
    const escalationResult = await escalateToCallCentre({
      sessionId,
      userId,
      reason,
      chatHistory,
      attempts: totalAttempts
    });

    // Clear session attempts after escalation
    sessionAttempts.delete(sessionId);

    return NextResponse.json({
      escalate: true,
      callCentre: escalationResult,
      message: 'We\'re connecting you with a human agent who can better assist you.'
    });

  } catch (error) {
    console.error('Escalation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process escalation request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

interface ChatHistoryItem {
  message: string;
  timestamp: string;
  satisfaction?: 'satisfied' | 'unsatisfied';
}

async function escalateToCallCentre(data: {
  sessionId: string;
  userId?: string;
  reason: string;
  chatHistory: ChatHistoryItem[];
  attempts: number;
}): Promise<CallCentreResponse> {
  // Simulate call centre API integration
  // In production, this would integrate with your actual call centre system
  
  const ticketId = `TLK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Simulate call centre availability check
  const agentAvailable = Math.random() > 0.3; // 70% chance agent is available
  const estimatedWaitTime = agentAvailable ? 
    Math.floor(Math.random() * 5) + 1 : // 1-5 minutes if available
    Math.floor(Math.random() * 30) + 10; // 10-40 minutes if busy

  // Log escalation for monitoring
  console.log('Call Centre Escalation:', {
    ticketId,
    sessionId: data.sessionId,
    userId: 'user-telkom-12345',
    reason: data.reason,
    attempts: data.attempts,
    timestamp: new Date().toISOString()
  });

  // Send ticket data to admin dashboard
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticketId,
        sessionId: data.sessionId,
        userId: 'user-telkom-12345',
        reason: data.reason,
        attempts: data.attempts,
        timestamp: new Date().toISOString(),
        chatHistory: data.chatHistory
      })
    });
  } catch (error) {
    console.error('Failed to send ticket to admin dashboard:', error);
  }

  // In production, you might:
  // 1. Create a ticket in your CRM system
  // 2. Send notification to call centre agents
  // 3. Queue the customer for callback
  // 4. Send SMS/email with ticket details
  
  return {
    success: true,
    ticketId,
    estimatedWaitTime,
    agentAvailable,
    callbackNumber: agentAvailable ? undefined : '+27-10-210-0000'
  };
}

// GET endpoint for checking escalation status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Missing sessionId parameter' },
      { status: 400 }
    );
  }

  const attempts = sessionAttempts.get(sessionId) || 0;
  
  return NextResponse.json({
    sessionId,
    attempts,
    attemptsRemaining: Math.max(0, 3 - attempts),
    escalationThreshold: 3,
    canEscalate: attempts >= 3
  });
}

// DELETE endpoint for resetting session attempts
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Missing sessionId parameter' },
      { status: 400 }
    );
  }

  sessionAttempts.delete(sessionId);
  
  return NextResponse.json({
    success: true,
    message: `Session ${sessionId} attempts reset`
  });
}
