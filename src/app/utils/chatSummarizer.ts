interface ChatMessage {
  message: string;
  timestamp: string;
  satisfaction?: number;
}

interface ChatSummary {
  summary: string;
  keyIssues: string[];
  customerSentiment: 'positive' | 'neutral' | 'negative';
  escalationTriggers: string[];
  messageCount: number;
  duration: string;
}

export function summarizeChatHistory(chatHistory: ChatMessage[]): ChatSummary {
  if (!chatHistory || chatHistory.length === 0) {
    return {
      summary: 'No conversation history available',
      keyIssues: [],
      customerSentiment: 'neutral',
      escalationTriggers: [],
      messageCount: 0,
      duration: '0 minutes'
    };
  }

  // Extract customer messages (assuming odd indices are customer, even are bot)
  const customerMessages = chatHistory.filter((_, index) => index % 2 === 1);
  const botMessages = chatHistory.filter((_, index) => index % 2 === 0);
  
  // Calculate duration
  const startTime = new Date(chatHistory[0].timestamp);
  const endTime = new Date(chatHistory[chatHistory.length - 1].timestamp);
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationMinutes = Math.round(durationMs / (1000 * 60));
  
  // Identify key issues from customer messages
  const keyIssues = extractKeyIssues(customerMessages);
  
  // Determine customer sentiment
  const customerSentiment = analyzeSentiment(chatHistory);
  
  // Find escalation triggers (messages marked as not helpful)
  const escalationTriggers = chatHistory
    .filter(msg => msg.satisfaction === 0)
    .map(msg => msg.message.substring(0, 100) + (msg.message.length > 100 ? '...' : ''));
  
  // Generate summary
  const summary = generateSummary(customerMessages, keyIssues, escalationTriggers);
  
  return {
    summary,
    keyIssues,
    customerSentiment,
    escalationTriggers,
    messageCount: chatHistory.length,
    duration: `${durationMinutes} minute${durationMinutes !== 1 ? 's' : ''}`
  };
}

function extractKeyIssues(customerMessages: ChatMessage[]): string[] {
  const issues: string[] = [];
  const keywords = {
    'fiber': ['fiber', 'internet', 'connection', 'slow', 'speed', 'wifi'],
    'mobile': ['mobile', 'phone', 'data', 'network', 'signal', 'coverage'],
    'billing': ['bill', 'payment', 'charge', 'account', 'invoice', 'cost'],
    'technical': ['not working', 'broken', 'error', 'problem', 'issue', 'fault'],
    'service': ['service', 'support', 'help', 'assistance', 'complaint']
  };

  customerMessages.forEach(msg => {
    const text = msg.message.toLowerCase();
    Object.entries(keywords).forEach(([category, words]) => {
      if (words.some(word => text.includes(word)) && !issues.includes(category)) {
        issues.push(category);
      }
    });
  });

  return issues.length > 0 ? issues : ['general inquiry'];
}

function analyzeSentiment(chatHistory: ChatMessage[]): 'positive' | 'neutral' | 'negative' {
  const negativeWords = ['frustrated', 'angry', 'terrible', 'awful', 'hate', 'worst', 'useless', 'disappointed'];
  const positiveWords = ['great', 'good', 'excellent', 'thanks', 'helpful', 'appreciate', 'perfect'];
  
  let sentimentScore = 0;
  const unhelpfulCount = chatHistory.filter(msg => msg.satisfaction === 0).length;
  
  // Heavy weight for satisfaction ratings
  sentimentScore -= unhelpfulCount * 2;
  
  // Analyze text sentiment
  chatHistory.forEach(msg => {
    const text = msg.message.toLowerCase();
    negativeWords.forEach(word => {
      if (text.includes(word)) sentimentScore -= 1;
    });
    positiveWords.forEach(word => {
      if (text.includes(word)) sentimentScore += 1;
    });
  });
  
  if (sentimentScore <= -2) return 'negative';
  if (sentimentScore >= 2) return 'positive';
  return 'neutral';
}

function generateSummary(customerMessages: ChatMessage[], keyIssues: string[], escalationTriggers: string[]): string {
  if (customerMessages.length === 0) {
    return 'Customer initiated chat but did not provide specific details.';
  }

  const firstMessage = customerMessages[0]?.message || '';
  const issueText = keyIssues.length > 0 ? keyIssues.join(', ') : 'general inquiry';
  const escalationText = escalationTriggers.length > 0 ? 
    ` Customer was unsatisfied with ${escalationTriggers.length} response${escalationTriggers.length > 1 ? 's' : ''}.` : '';

  // Try to extract the main issue from the first customer message
  const mainIssue = firstMessage.length > 10 ? 
    firstMessage.substring(0, 150) + (firstMessage.length > 150 ? '...' : '') : 
    `Customer contacted regarding ${issueText}`;

  return `${mainIssue}${escalationText} Conversation involved ${customerMessages.length} customer message${customerMessages.length > 1 ? 's' : ''}.`;
}
