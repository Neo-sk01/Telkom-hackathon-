import { NextRequest, NextResponse } from 'next/server';
import { summarizeChatHistory } from '../../../utils/chatSummarizer';

interface ChatMessage {
  message: string;
  timestamp: string;
  satisfaction?: number;
}

interface EscalationTicket {
  ticketId: string;
  sessionId: string;
  userId: string;
  reason: string;
  attempts: number;
  timestamp: string;
  chatHistory: ChatMessage[];
  status: 'open' | 'in_progress' | 'resolved';
  assignedAgent?: string;
  summary?: {
    summary: string;
    keyIssues: string[];
    customerSentiment: 'positive' | 'neutral' | 'negative';
    escalationTriggers: string[];
    messageCount: number;
    duration: string;
  };
}

// In-memory storage for demo purposes
// In production, this would be a database
const tickets: Map<string, EscalationTicket> = new Map();

// Add some test data for debugging
const testTicket: EscalationTicket = {
  ticketId: 'TLK-TEST-12345',
  sessionId: 'session-test-67890',
  userId: 'user-telkom-12345',
  reason: 'Customer satisfaction threshold reached',
  attempts: 3,
  timestamp: new Date().toISOString(),
  chatHistory: [
    {
      message: 'Hello! I\'m your Telkom virtual assistant. How can I help you today?',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      satisfaction: undefined
    },
    {
      message: 'I need help with my fiber connection',
      timestamp: new Date(Date.now() - 240000).toISOString(),
      satisfaction: undefined
    },
    {
      message: 'I can help you with fiber connection issues. Let me check our available solutions...',
      timestamp: new Date(Date.now() - 180000).toISOString(),
      satisfaction: 0
    },
    {
      message: 'That didn\'t help, I still have no internet',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      satisfaction: undefined
    },
    {
      message: 'Let me provide you with technical troubleshooting steps...',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      satisfaction: 0
    }
  ],
  status: 'open',
  assignedAgent: undefined
};

tickets.set(testTicket.ticketId, testTicket);

// GET - Fetch all tickets
export async function GET() {
  try {
    const ticketList = Array.from(tickets.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      success: true,
      tickets: ticketList,
      count: ticketList.length
    });
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

// POST - Create new ticket (called from escalation)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const ticket: EscalationTicket = {
      ticketId: data.ticketId,
      sessionId: data.sessionId,
      userId: data.userId || 'user-telkom-12345',
      reason: data.reason,
      attempts: data.attempts,
      timestamp: data.timestamp || new Date().toISOString(),
      chatHistory: data.chatHistory || [],
      status: 'open',
      assignedAgent: undefined,
      summary: data.chatHistory && data.chatHistory.length > 0 ? 
        summarizeChatHistory(data.chatHistory) : undefined
    };

    tickets.set(ticket.ticketId, ticket);

    console.log('New ticket created for admin dashboard:', {
      ticketId: ticket.ticketId,
      sessionId: ticket.sessionId,
      chatHistoryLength: ticket.chatHistory.length
    });

    return NextResponse.json({
      success: true,
      ticket,
      message: 'Ticket created successfully'
    });
  } catch (error) {
    console.error('Failed to create ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}

// PATCH - Update ticket status and chat history
export async function PATCH(request: NextRequest) {
  try {
    const { ticketId, status, assignedAgent, chatHistory, sessionId, userId, attempts } = await request.json();

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Missing ticketId' },
        { status: 400 }
      );
    }

    const ticket = tickets.get(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Update ticket properties
    if (status) {
      ticket.status = status;
    }
    if (assignedAgent) {
      ticket.assignedAgent = assignedAgent;
    }
    if (chatHistory) {
      ticket.chatHistory = chatHistory;
      // Regenerate summary when chat history is updated
      ticket.summary = summarizeChatHistory(chatHistory);
    }
    if (sessionId) {
      ticket.sessionId = sessionId;
    }
    if (userId) {
      ticket.userId = userId;
    }
    if (attempts) {
      ticket.attempts = attempts;
    }

    tickets.set(ticketId, ticket);

    console.log('Ticket updated with chat history:', {
      ticketId,
      chatHistoryLength: ticket.chatHistory.length,
      status: ticket.status
    });

    return NextResponse.json({
      success: true,
      ticket,
      message: 'Ticket updated successfully'
    });
  } catch (error) {
    console.error('Failed to update ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

// DELETE - Delete ticket
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticketId');

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Missing ticketId parameter' },
        { status: 400 }
      );
    }

    const deleted = tickets.delete(ticketId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete ticket:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}
