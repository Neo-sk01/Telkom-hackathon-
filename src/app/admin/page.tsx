'use client';

import { useState, useEffect } from 'react';

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
}

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<EscalationTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<EscalationTicket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/admin/tickets');
      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      await fetch('/api/admin/tickets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticketId, status }),
      });
      fetchTickets();
    } catch (error) {
      console.error('Failed to update ticket:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Telkom Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {tickets.length} Total Tickets
              </span>
              <button
                onClick={fetchTickets}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tickets List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Escalation Tickets</h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.ticketId}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedTicket?.ticketId === ticket.ticketId ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {ticket.ticketId}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatTimestamp(ticket.timestamp)}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 truncate">
                      {ticket.reason}
                    </p>
                  </div>
                ))}
                {tickets.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No escalation tickets found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">
                      Ticket Details: {selectedTicket.ticketId}
                    </h2>
                    <div className="flex space-x-2">
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => updateTicketStatus(selectedTicket.ticketId, e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Ticket Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Session ID</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTicket.sessionId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">User ID</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTicket.userId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Attempts</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTicket.attempts}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created</label>
                      <p className="mt-1 text-sm text-gray-900">{formatTimestamp(selectedTicket.timestamp)}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{selectedTicket.reason}</p>
                  </div>

                  {/* Chat History */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Chat History</label>
                    <div className="border border-gray-200 rounded-md max-h-96 overflow-y-auto">
                      {selectedTicket.chatHistory.map((msg, index) => (
                        <div key={index} className="p-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(msg.timestamp)}
                            </span>
                            {msg.satisfaction !== undefined && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                msg.satisfaction === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {msg.satisfaction === 1 ? 'Helpful' : 'Not Helpful'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-900">{msg.message}</p>
                        </div>
                      ))}
                      {selectedTicket.chatHistory.length === 0 && (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No chat history available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Ticket</h3>
                <p className="text-gray-500">Choose a ticket from the list to view its details and chat history.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
