import { NextRequest, NextResponse } from 'next/server';

// POST - Sync localStorage data with admin dashboard
export async function POST(request: NextRequest) {
  try {
    const { escalationData, ticketId } = await request.json();

    if (!escalationData || !ticketId) {
      return NextResponse.json(
        { error: 'Missing escalationData or ticketId' },
        { status: 400 }
      );
    }

    // Create or update ticket with chat history from localStorage
    // First try to create the ticket, if it exists it will be updated
    const ticketData = {
      ticketId: ticketId,
      sessionId: escalationData.sessionId,
      userId: escalationData.userId,
      reason: escalationData.reason,
      attempts: escalationData.attempts,
      timestamp: escalationData.timestamp,
      chatHistory: escalationData.chatHistory
    };

    // Try to create the ticket first
    const createResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/admin/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketData)
    });

    let finalResponse = createResponse;

    // If creation fails (ticket might already exist), try to update
    if (!createResponse.ok) {
      const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/admin/tickets`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId: ticketId,
          chatHistory: escalationData.chatHistory,
          sessionId: escalationData.sessionId,
          userId: escalationData.userId,
          attempts: escalationData.attempts
        })
      });
      finalResponse = updateResponse;
    }

    if (!finalResponse.ok) {
      const errorText = await finalResponse.text();
      console.error('Ticket operation failed:', errorText);
      throw new Error(`Failed to create/update ticket: ${errorText}`);
    }

    console.log('Successfully synced localStorage data to admin dashboard:', {
      ticketId,
      chatHistoryLength: escalationData.chatHistory.length
    });

    return NextResponse.json({
      success: true,
      message: 'Chat history synced successfully',
      ticketId
    });

  } catch (error) {
    console.error('Failed to sync localStorage data:', error);
    return NextResponse.json(
      { error: 'Failed to sync localStorage data' },
      { status: 500 }
    );
  }
}
