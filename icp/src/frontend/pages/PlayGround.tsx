import React, { useState, useRef, useEffect } from 'react';
import { useCheckText } from '../hooks/useCheckText';
import { CheckResponse } from '../models/check.model';

const PlayGround: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [context] = useState<Record<string, any>>({});
  const [chatHistory, setChatHistory] = useState<{ 
    id: string;
    user: string; 
    response: CheckResponse; 
    timestamp: Date;
    processingTime?: number;
  }[]>([]);

  const { mutate, isPending, error } = useCheckText();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const generateId = () => Math.random().toString(36).substring(2, 9);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    mutate({ text: inputText, context }, {
      onSuccess: (response) => {
        setChatHistory((prev) => [...prev, { 
          id: generateId(),
          user: inputText, 
          response: response, 
          timestamp: new Date(),
        }]);
        setInputText('');
        setTimeout(() => inputRef.current?.focus(), 0);
      },
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-red-400';
    if (confidence >= 0.7) return 'bg-yellow-300';
    return 'bg-green-300';
  };

  return (
    <div className="relative flex h-screen text-gray-800 font-sans">
      {/* Chat Interface */}
      <div className="flex flex-col w-full h-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b px-6 flex items-center">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 54 54" fill="#232F3E">
              <path d="M11.278 26.1c0 .667-.533 1.2-1.2 1.2h-1.333c-1.867 0-3.4-1.534-3.4-3.4v-.667c0-4.4 3.6-8 8-8h1.798c1.725 0 3.2 1.543 3.419 3.354l-.277 1.75c-1.111 7.302-9.5 12.6-15.107 12.6H9.461c-1.867 0-3.4-1.533-3.4-3.4v-1.1c0-3.4 2.734-6.134 6.1-6.1 3.367 0 6.1 2.734 6.1 6.1v1.798l4.8-4.8-4.8-4.8v1.798c0 1.867 1.533 3.4 3.4 3.4h1.334c.667 0 1.2-.533 1.2-1.2V26.1z" />
            </svg>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Consensus Sentry Gaurdrail Safety Suite</h1>
              <p className="text-xs text-gray-500">Real-time Content Moderation</p>
            </div>
          </div>
        </div>


          <div className="flex-grow flex flex-col">
            {/* Chat Container */}
            <div 
              ref={chatContainerRef}
              className="flex-grow overflow-y-auto p-6 space-y-6"
            >
              {chatHistory.map((item) => (
                <div key={item.timestamp.getTime()} className="space-y-6">
                  {/* User Query */}
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full mr-4 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5m0 0a7 7 0 110-14 7 7 0 010 14zm0 0m0 0a2.009 2.009 0 01-1.414-1.414m-4 10c1.383 0 2.5-1.117 2.5-2.5S8.683 10 7 10s-2.5 1.117-2.5 2.5 1.117 2.5 2.5 2.5zm6-4c1.383 0 2.5-1.117 2.5-2.5S16.383 6 15 6s-2.5 1.117-2.5 2.5 1.117 2.5 2.5 2.5z" />
                      </svg>
                    </div>
                    <div className="flex-grow">
                      <p className="p-3 rounded-lg text-gray-800 max-w-md">
                        <span className="text-gray-600 text-sm">{item.user}</span>
                      </p>
                    </div>
                  </div>
                  {/* AI Response */}
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 mr-4 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="flex-grow">
                      <div className="bg-white p-3 rounded-lg shadow-sm space-y-4">
                        {item.response.violations?.map((violation) => (
                          <div 
                            key={violation.rule_id} 
                            className={`p-3 rounded-full flex items-center space-x-2 ${getConfidenceColor(violation.confidence)}`}
                          >
                            <span className="font-semibold">{violation.type}</span>
                            <span className="text-xs text-black font-semibold bg-white p-1 rounded-full">
                              {Math.round(violation.confidence * 100)}%
                            </span>
                          </div>
                        ))}
                        <div className="text-gray-600 text-sm">
                          {item.response.message}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form 
              onSubmit={handleSubmit}
              className="absolute bottom-0 left-0 w-full bg-white p-4 border-t flex items-center space-x-2 mb-4"
            >
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={1}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter text to analyze..."
              />
              <button
                type="submit"
                disabled={isPending}
                className={`px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black disabled:bg-blue-300
                  ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600 active:bg-gray-700'}
                `}
              >
                {isPending ? 'Analyzing...' : 'Check Content'}
              </button>
            </form>
          </div>
        
      </div>

      {/* Error Overlay */}
      {error && (
        <div className="fixed inset-0 bg-red-100 opacity-95 flex items-center justify-center">
          <div className="bg-red-200 p-4 rounded-lg shadow-lg text-center">
            <h1 className="text-red-800 font-semibold">Error</h1>
            <p className="text-sm">{error.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayGround;