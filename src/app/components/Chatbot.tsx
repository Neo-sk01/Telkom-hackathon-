'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
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

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputMessage),
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
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
                <p className="text-blue-100 text-sm font-medium">Online now</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-500 hover:bg-opacity-30 transition-all duration-200"
          >
            ×
          </button>
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
                    : 'bg-white text-gray-800 rounded-bl-md border border-gray-100 shadow-gray-100'
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{message.text}</p>
                <p className={`text-xs mt-2 ${message.isUser ? 'text-blue-100' : 'text-gray-400'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
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
              placeholder="Type your message..."
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-bold text-gray-800 placeholder-gray-400 bg-gray-50 hover:bg-white"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:transform-none"
            >
              <span className="hidden sm:inline">Send</span>
              <span className="sm:hidden">→</span>
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
