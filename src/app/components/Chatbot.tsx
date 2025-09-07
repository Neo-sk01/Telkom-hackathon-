'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isN8nResponse?: boolean;
  n8nData?: any;
  satisfaction?: 'satisfied' | 'unsatisfied' | null;
  showFeedback?: boolean;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const Chatbot = ({ isOpen, onClose }: ChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Telkom virtual assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const n8nWebhookUrl = 'https://khvvtso.app.n8n.cloud/webhook/9b5f7142-0410-4e8d-ad62-f8d63fd39052';
  //const n8nWebhookUrl = 'https://khvvtso.app.n8n.cloud/webhook-test/9b5f7142-0410-4e8d-ad62-f8d63fd39052';
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const userId = 'user-telkom-12345';
  const [unsatisfiedCount, setUnsatisfiedCount] = useState(0);
  const [showEscalation, setShowEscalation] = useState(false);
  const [awaitingPhoneNumber, setAwaitingPhoneNumber] = useState(false);
  const [pendingChatHistory, setPendingChatHistory] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('plan') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return 'We have several plans available:\n• Starter: R299/month (20GB data)\n• Premium: R599/month (100GB data)\n• Business: R999/month (Unlimited data)\n\nWould you like more details about any specific plan?';
    }
    
    if (lowerMessage.includes('fiber') || lowerMessage.includes('internet') || lowerMessage.includes('wifi')) {
      return 'Our fiber internet offers speeds up to 1Gbps with reliable connectivity. We have various packages starting from R399/month. Would you like me to check availability in your area?';
    }
    
    if (lowerMessage.includes('5g') || lowerMessage.includes('network') || lowerMessage.includes('coverage')) {
      return 'Telkom\'s 5G network covers major cities and towns across South Africa. Our network provides excellent coverage with 99.9% uptime. You can check coverage in your area on our website or I can help you with that.';
    }
    
    if (lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('problem') || lowerMessage.includes('issue')) {
      return 'I\'m here to help! For technical support, you can:\n• Chat with me for quick questions\n• Call our support line: 10210\n• Visit a Telkom store\n• Use our self-service portal\n\nWhat specific issue are you experiencing?';
    }
    
    if (lowerMessage.includes('data') || lowerMessage.includes('bundle')) {
      return 'We offer various data bundles:\n• Daily bundles from R5\n• Weekly bundles from R25\n• Monthly bundles from R99\n• Anytime data and night surfer options\n\nWhich type of data bundle interests you?';
    }
    
    if (lowerMessage.includes('store') || lowerMessage.includes('location') || lowerMessage.includes('branch')) {
      return 'You can find Telkom stores nationwide. Our major locations include:\n• Telkom Towers, Pretoria\n• Canal Walk, Cape Town\n• Sandton City, Johannesburg\n• Gateway, Durban\n\nWould you like me to help you find the nearest store to your location?';
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'Hello! Welcome to Telkom. I\'m here to assist you with any questions about our services, plans, or support. What can I help you with today?';
    }
    
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return 'You\'re welcome! Is there anything else I can help you with regarding Telkom services?';
    }
    
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
      return 'Thank you for choosing Telkom! Have a great day. Feel free to chat with me anytime if you need assistance.';
    }
    
    // Default response
    return 'I understand you\'re asking about "' + userMessage + '". Let me connect you with the right information. You can also call our support line at 10210 for immediate assistance, or I can help you with:\n• Plans and pricing\n• Fiber internet\n• Mobile services\n• Technical support\n• Store locations';
  };

  const sendToN8n = async (text: string) => {
    if (!n8nWebhookUrl) return null;

    try {
      const response = await fetch('/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          n8nWebhookUrl: n8nWebhookUrl
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to send to n8n:', error);
      return null;
    }
  };


  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Check if we're waiting for a phone number
    if (awaitingPhoneNumber) {
      await handlePhoneNumberInput(inputMessage.trim());
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    // Send to n8n and get AI response
    const n8nResponse = await sendToN8n(currentMessage);

    // Simulate typing delay
    setTimeout(() => {
      if (n8nResponse && n8nResponse.success && n8nResponse.data?.n8nResponse) {
        // Add n8n AI response as chat bubble
        n8nResponse.data.n8nResponse.forEach((item: any, index: number) => {
          const n8nMessage: Message = {
            id: `n8n-${Date.now()}-${index}`,
            text: item.output,
            isUser: false,
            timestamp: new Date(),
            isN8nResponse: true,
            n8nData: n8nResponse.data,
            satisfaction: null,
            showFeedback: true
          };
          
          setMessages(prev => [...prev, n8nMessage]);
        });
      } else {
        // Show error if n8n fails
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          text: "Sorry, I'm having trouble connecting to the AI assistant. Please try again.",
          isUser: false,
          timestamp: new Date(),
          satisfaction: null,
          showFeedback: true
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
      
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSatisfactionFeedback = async (messageId: string, satisfaction: 'satisfied' | 'unsatisfied') => {
    // Update message satisfaction
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, satisfaction, showFeedback: false }
        : msg
    ));

    if (satisfaction === 'unsatisfied') {
      const newCount = unsatisfiedCount + 1;
      setUnsatisfiedCount(newCount);

      // Check if escalation threshold is reached
      if (newCount >=1) {
        await escalateToCallCentre();
      }
    }
  };

  const escalateToCallCentre = async () => {
    try {
      const chatHistory = messages.map(msg => ({
        message: msg.text,
        timestamp: msg.timestamp.toISOString(),
        satisfaction: msg.satisfaction
      }));

      // Save chat history to localStorage for admin dashboard
      const localStorageData = {
        sessionId,
        userId,
        reason: 'Customer satisfaction threshold reached',
        chatHistory,
        timestamp: new Date().toISOString(),
        attempts: unsatisfiedCount
      };
      
      localStorage.setItem('escalationData', JSON.stringify(localStorageData));
      console.log('Chat history saved to localStorage:', localStorageData);

      // First, check escalation status
      const escalationResponse = await fetch('/api/escalate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          reason: 'Customer satisfaction threshold reached',
          chatHistory
        })
      });

      const escalationData = await escalationResponse.json();
      
      if (escalationData.escalate) {
        setShowEscalation(true);
        
        // Trigger call initiation event for localStorage sync
        const callInitiatedEvent = new CustomEvent('callInitiated', {
          detail: {
            callId: escalationData.callCentre?.callId || 'N/A',
            ticketId: escalationData.callCentre?.ticketId || 'N/A'
          }
        });
        window.dispatchEvent(callInitiatedEvent);

        // Add escalation message to chat
        const escalationMessage: Message = {
          id: `escalation-${Date.now()}`,
          text: `We're connecting you to our call centre for personalized assistance.\n\nTicket ID: ${escalationData.callCentre?.ticketId || 'N/A'}`,
          isUser: false,
          timestamp: new Date(),
          satisfaction: null,
          showFeedback: false
        };
        
        setMessages(prev => [...prev, escalationMessage]);
        
        // Request phone number from user (don't call immediately)
        await requestPhoneNumber(chatHistory);
      }
    } catch (error) {
      console.error('Escalation failed:', error);
    }
  };

  const requestPhoneNumber = async (chatHistory: any[]) => {
    setPendingChatHistory(chatHistory);
    setAwaitingPhoneNumber(true);
    
    const phoneRequestMessage: Message = {
      id: `phone-request-${Date.now()}`,
      text: '📞 To connect you with a human agent, please enter your phone number so we can call you immediately.\n\nExample: +27123456789 or 0123456789',
      isUser: false,
      timestamp: new Date(),
      satisfaction: null,
      showFeedback: false
    };
    
    setMessages(prev => [...prev, phoneRequestMessage]);
  };

  const handlePhoneNumberInput = async (phoneNumber: string) => {
    setInputMessage('');
    setAwaitingPhoneNumber(false);
    
    // Add user's phone number as a message
    const phoneMessage: Message = {
      id: `phone-${Date.now()}`,
      text: phoneNumber,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, phoneMessage]);
    
    // Validate phone number format
    const phoneRegex = /^(\+27|0)[0-9]{9}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[\s-]/g, ''))) {
      const invalidPhoneMessage: Message = {
        id: `invalid-phone-${Date.now()}`,
        text: '❌ Invalid phone number format. Please enter a valid South African number (e.g., +27123456789 or 0123456789).\n\nPlease try again:',
        isUser: false,
        timestamp: new Date(),
        satisfaction: null,
        showFeedback: false
      };
      setMessages(prev => [...prev, invalidPhoneMessage]);
      setAwaitingPhoneNumber(true);
      return;
    }
    
    await initiatePhoneCall(phoneNumber, pendingChatHistory);
  };

  const initiatePhoneCall = async (customerPhone: string, chatHistory: any[]) => {
    try {

      const callResponse = await fetch('/api/call-centre', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          userId,
          customerPhone,
          customerName: 'Telkom Customer',
          issue: 'AI assistant unable to resolve customer query after multiple attempts',
          chatHistory,
          urgency: 'high'
        })
      });

      const callData = await callResponse.json();

      console.log('Call Centre Response:', callData);
      
      if (callData.success) {
        const callMessage: Message = {
          id: `call-${Date.now()}`,
          text: `✅ Call initiated successfully!\n\n📞 ${callData.message}\n\nCall ID: ${callData.callId}\n${callData.agentId ? `Agent ${callData.agentId} will be calling you shortly.` : ''}\n\nPlease keep your phone nearby and answer when we call.`,
          isUser: false,
          timestamp: new Date(),
          satisfaction: null,
          showFeedback: false
        };
        
        setMessages(prev => [...prev, callMessage]);
      } else {
        const callErrorMessage: Message = {
          id: `call-error-${Date.now()}`,
          text: `❌ ${callData.error || callData.message || 'Failed to initiate call'}\n\nPlease contact us directly at +27-10-210-0000 for immediate assistance.`,
          isUser: false,
          timestamp: new Date(),
          satisfaction: null,
          showFeedback: false
        };
        
        setMessages(prev => [...prev, callErrorMessage]);
      }
    } catch (error) {
      console.error('Phone call initiation failed:', error);
      
      const errorMessage: Message = {
        id: `call-error-${Date.now()}`,
        text: '❌ Unable to initiate call at this time. Please contact us directly at +27-10-210-0000 for immediate assistance.',
        isUser: false,
        timestamp: new Date(),
        satisfaction: null,
        showFeedback: false
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col border border-blue-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white ring-opacity-30">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">Telkom Support</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-blue-100 text-sm font-medium">
                  AI Assistant Ready
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-500 hover:bg-opacity-30 transition-all duration-200"
            >
              ×
            </button>
          </div>
        </div>


        {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-blue-50/30 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                    message.isUser
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md shadow-blue-200'
                      : message.isN8nResponse
                      ? 'bg-white text-gray-800 rounded-bl-md border border-blue-200 shadow-blue-100'
                      : 'bg-white text-gray-800 rounded-bl-md border border-gray-100 shadow-gray-100'
                  }`}
                >
                  {message.isN8nResponse ? (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">n8n</span>
                      </div>
                      <div className="flex-1">
                        <p className="whitespace-pre-line leading-relaxed">{message.text}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {message.showFeedback && message.satisfaction === null && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleSatisfactionFeedback(message.id, 'satisfied')}
                              className="flex items-center gap-1 px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                            >
                              👍 Helpful
                            </button>
                            <button
                              onClick={() => handleSatisfactionFeedback(message.id, 'unsatisfied')}
                              className="flex items-center gap-1 px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                            >
                              👎 Not helpful
                            </button>
                          </div>
                        )}
                        {message.satisfaction && (
                          <div className="mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              message.satisfaction === 'satisfied' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {message.satisfaction === 'satisfied' ? '✓ Marked as helpful' : '✗ Marked as not helpful'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-line leading-relaxed">{message.text}</p>
                      <p className={`text-xs mt-2 ${message.isUser ? 'text-blue-100' : 'text-gray-400'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {!message.isUser && message.showFeedback && message.satisfaction === null && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleSatisfactionFeedback(message.id, 'satisfied')}
                            className="flex items-center gap-1 px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                          >
                            👍 Helpful
                          </button>
                          <button
                            onClick={() => handleSatisfactionFeedback(message.id, 'unsatisfied')}
                            className="flex items-center gap-1 px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                          >
                            👎 Not helpful
                          </button>
                        </div>
                      )}
                      {!message.isUser && message.satisfaction && (
                        <div className="mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            message.satisfaction === 'satisfied' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {message.satisfaction === 'satisfied' ? '✓ Marked as helpful' : '✗ Marked as not helpful'}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white text-gray-800 p-4 rounded-2xl rounded-bl-md border border-gray-100 shadow-sm">
                  <div className="flex space-x-1 items-center">
                    <span className="text-gray-500 text-sm mr-2">Telkom is typing</span>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        

        {/* Input */}
          <div className="p-5 border-t border-gray-100 bg-white">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={awaitingPhoneNumber ? "Enter your phone number..." : "Type your message..."}
                className={`flex-1 border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-200 font-bold text-gray-800 placeholder-gray-400 bg-gray-50 hover:bg-white ${
                  awaitingPhoneNumber 
                    ? 'border-orange-300 focus:ring-orange-500 focus:border-orange-500' 
                    : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className={`px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:transform-none transition-all duration-200 disabled:cursor-not-allowed ${
                  awaitingPhoneNumber
                    ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:from-gray-300 disabled:to-gray-400'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400'
                }`}
              >
                <span className="hidden sm:inline">{awaitingPhoneNumber ? 'Submit' : 'Send'}</span>
                <span className="sm:hidden">{awaitingPhoneNumber ? '📞' : '→'}</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => setInputMessage('What are your current plans?')}
                className="text-sm bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-4 py-2 rounded-full hover:from-blue-100 hover:to-blue-200 transition-all duration-200 font-medium border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transform hover:scale-105"
              >
                💼 View Plans
              </button>
              <button
                onClick={() => setInputMessage('Check fiber availability')}
                className="text-sm bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-4 py-2 rounded-full hover:from-blue-100 hover:to-blue-200 transition-all duration-200 font-medium border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transform hover:scale-105"
              >
                🌐 Fiber Internet
              </button>
              <button
                onClick={() => setInputMessage('I need technical support')}
                className="text-sm bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-4 py-2 rounded-full hover:from-blue-100 hover:to-blue-200 transition-all duration-200 font-medium border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transform hover:scale-105"
              >
                🔧 Technical Support
              </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Chatbot;
