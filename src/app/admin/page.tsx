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
  phoneNumber?: string;
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

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<EscalationTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<EscalationTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'details' | 'history'>('summary');
  const [phoneData, setPhoneData] = useState<{sessionId: string; userId: string; phoneNumber: string; timestamp: string} | null>(null);

  useEffect(() => {
    fetchTickets();
    loadPhoneData();
  }, []);

  const loadPhoneData = () => {
    try {
      const storedPhoneData = localStorage.getItem('customerPhoneData');
      if (storedPhoneData) {
        setPhoneData(JSON.parse(storedPhoneData));
      }
    } catch (error) {
      console.error('Failed to load phone data from localStorage:', error);
    }
  };

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

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-700 font-medium">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-900">Telkom Admin Dashboard</h1>
                <p className="text-blue-600 text-sm">Call Centre Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-semibold text-blue-800">
                  {tickets.length} Total Tickets
                </span>
              </div>
              <button
                onClick={fetchTickets}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Escalation Tickets */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-blue-100">
              <div className="px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  🎫 Escalation Tickets
                </h2>
              </div>
              <div className="divide-y divide-blue-50 max-h-96 overflow-y-auto">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.ticketId}
                    className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors ${
                      selectedTicket?.ticketId === ticket.ticketId ? 'bg-blue-100 border-l-4 border-blue-600' : ''
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-blue-900 truncate">
                          {ticket.ticketId}
                        </p>
                        <p className="text-xs text-blue-600">
                          {formatTimestamp(ticket.timestamp)}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate mb-2">
                      {ticket.reason}
                    </p>
                    {ticket.summary && (
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(ticket.summary.customerSentiment)}`}>
                          {ticket.summary.customerSentiment}
                        </span>
                        <span className="text-xs text-gray-500">
                          {ticket.summary.messageCount} msgs
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {tickets.length === 0 && (
                  <div className="p-8 text-center text-blue-400">
                    <div className="text-4xl mb-2">📋</div>
                    <p>No escalation tickets found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {selectedTicket ? (
              <div className="space-y-6">
                {/* Tab Navigation */}
                <div className="bg-white rounded-xl shadow-lg border border-blue-100">
                  <div className="border-b border-blue-100">
                    <nav className="flex space-x-8 px-6" aria-label="Tabs">
                      <button
                        onClick={() => setActiveTab('summary')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === 'summary'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'
                        }`}
                      >
                        📊 Chat Summary
                      </button>
                      <button
                        onClick={() => setActiveTab('details')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === 'details'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'
                        }`}
                      >
                        🎫 Ticket Details
                      </button>
                      <button
                        onClick={() => setActiveTab('history')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === 'history'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'
                        }`}
                      >
                        💬 Chat History
                      </button>
                    </nav>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-xl shadow-lg border border-blue-100">
                  <div className="px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-white">
                        {activeTab === 'summary' && '📊 Conversation Summary'}
                        {activeTab === 'details' && '🎫 Ticket Details'}
                        {activeTab === 'history' && '💬 Chat History'}
                      </h2>
                      <div className="flex items-center space-x-3">
                        <span className="text-blue-100 text-sm font-medium">
                          {selectedTicket.ticketId}
                        </span>
                        <select
                          value={selectedTicket.status}
                          onChange={(e) => updateTicketStatus(selectedTicket.ticketId, e.target.value)}
                          className="border border-blue-300 rounded-lg px-3 py-1 text-sm bg-white text-blue-900 font-medium"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {/* Chat Summary Tab */}
                    {activeTab === 'summary' && selectedTicket.summary && (
                      <div className="space-y-6">
                        {/* Main Summary */}
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-blue-900 mb-3">Conversation Overview</h3>
                          <p className="text-blue-800 leading-relaxed mb-4">{selectedTicket.summary.summary}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-blue-200">
                              <div className="text-2xl font-bold text-blue-600">{selectedTicket.summary.messageCount}</div>
                              <div className="text-sm text-blue-700">Total Messages</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-blue-200">
                              <div className="text-2xl font-bold text-blue-600">{selectedTicket.summary.duration}</div>
                              <div className="text-sm text-blue-700">Duration</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-blue-200">
                              <div className="text-2xl font-bold text-red-600">{selectedTicket.summary.escalationTriggers.length}</div>
                              <div className="text-sm text-blue-700">Unhelpful Responses</div>
                            </div>
                          </div>
                        </div>

                        {/* Key Issues */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Issues Identified</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedTicket.summary.keyIssues.map((issue, index) => (
                              <span key={index} className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                {issue}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Customer Sentiment */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Sentiment Analysis</h3>
                          <div className="flex items-center space-x-4">
                            <span className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold ${getSentimentColor(selectedTicket.summary.customerSentiment)}`}>
                              {selectedTicket.summary.customerSentiment === 'positive' && '😊 Positive'}
                              {selectedTicket.summary.customerSentiment === 'neutral' && '😐 Neutral'}
                              {selectedTicket.summary.customerSentiment === 'negative' && '😞 Negative'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ticket Details Tab */}
                    {activeTab === 'details' && (
                      <div className="space-y-6">
                        {/* Ticket Information */}
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Session ID</label>
                                <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border">{selectedTicket.sessionId}</p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                                <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border">{selectedTicket.userId}</p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border">
                                  {phoneData && phoneData.sessionId === selectedTicket.sessionId 
                                    ? phoneData.phoneNumber 
                                    : selectedTicket.phoneNumber || 'Not provided'}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Escalation Attempts</label>
                                <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border">{selectedTicket.attempts}</p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                                <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border">{formatTimestamp(selectedTicket.timestamp)}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Escalation Reason */}
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-red-900 mb-3">Escalation Reason</h3>
                          <p className="text-red-800 bg-white p-4 rounded-lg border border-red-200">{selectedTicket.reason}</p>
                        </div>
                      </div>
                    )}


                    {/* Chat History Tab */}
                    {activeTab === 'history' && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Conversation</h3>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {selectedTicket.chatHistory.map((msg, index) => (
                              <div key={index} className={`p-4 rounded-lg border ${
                                index % 2 === 0 ? 'bg-blue-50 border-blue-200 ml-0 mr-8' : 'bg-white border-gray-200 ml-8 mr-0'
                              }`}>
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                      index % 2 === 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {index % 2 === 0 ? '🤖 Bot' : '👤 Customer'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatTimestamp(msg.timestamp)}
                                    </span>
                                  </div>
                                  {msg.satisfaction !== undefined && (
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                      msg.satisfaction === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {msg.satisfaction === 1 ? '👍 Helpful' : '👎 Not Helpful'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-900 leading-relaxed">{msg.message}</p>
                              </div>
                            ))}
                            {selectedTicket.chatHistory.length === 0 && (
                              <div className="p-8 text-center text-gray-400">
                                <div className="text-4xl mb-2">💬</div>
                                <p>No chat history available</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-12 text-center">
                <div className="text-blue-300 mb-6">
                  <div className="text-6xl mb-4">🎫</div>
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-3">Select a Ticket</h3>
                <p className="text-blue-600">Choose a ticket from the list to view its summary, details, and chat history.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
