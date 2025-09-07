'use client';

import { useState } from 'react';

export default function WebhookTest() {
  const [text, setText] = useState('');
  const [n8nUrl, setN8nUrl] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const sendWebhook = async () => {
    if (!text || !n8nUrl) {
      alert('Please fill in both text and n8n webhook URL');
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          n8nWebhookUrl: n8nUrl
        })
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({
        success: false,
        error: 'Failed to send webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-900">Telkom Webhook Test</h1>
              <p className="text-blue-600">Test sending text to n8n</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                Text to Send
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the text you want to send to n8n..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium text-gray-800 placeholder-gray-400 bg-gray-50 hover:bg-white"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                n8n Webhook URL
              </label>
              <input
                type="url"
                value={n8nUrl}
                onChange={(e) => setN8nUrl(e.target.value)}
                placeholder="https://khvvtso.app.n8n.cloud/webhook/9b5f7142-0410-4e8d-ad62-f8d63fd39052"
                //placeholder="https://khvvtso.app.n8n.cloud/webhook-test/9b5f7142-0410-4e8d-ad62-f8d63fd3905"
                
                
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium text-gray-800 placeholder-gray-400 bg-gray-50 hover:bg-white"
              />
            </div>

            <button
              onClick={sendWebhook}
              disabled={loading || !text || !n8nUrl}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:transform-none"
            >
              {loading ? 'Sending...' : 'Send to n8n'}
            </button>

            {response && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Response:</h3>
                
                {/* Chat Bubble for n8n Response */}
                {response.success && response.data?.n8nResponse && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-blue-700 mb-2">n8n Response:</h4>
                    <div className="space-y-3">
                      {response.data.n8nResponse.map((item: any, index: number) => (
                        <div key={index} className="flex justify-start">
                          <div className="max-w-[85%] bg-white border border-blue-200 rounded-2xl rounded-bl-md p-4 shadow-sm">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <span className="text-white text-sm font-bold">n8n</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-800 leading-relaxed">{item.output}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {new Date(response.data.timestamp).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Response Details */}
                <div className={`p-4 rounded-xl border-2 ${
                  response.success 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <details className="cursor-pointer">
                    <summary className="font-medium mb-2">
                      {response.success ? '✅ Success Details' : '❌ Error Details'}
                    </summary>
                    <pre className="whitespace-pre-wrap text-sm font-mono mt-2">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">API Endpoint Information:</h4>
            <p className="text-sm text-blue-700 mb-2">
              <strong>Endpoint:</strong> <code className="bg-blue-100 px-2 py-1 rounded">/api/webhook</code>
            </p>
            <p className="text-sm text-blue-700 mb-2">
              <strong>Method:</strong> POST
            </p>
            <p className="text-sm text-blue-700">
              <strong>Payload:</strong> JSON with <code>text</code> and <code>n8nWebhookUrl</code> fields
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
