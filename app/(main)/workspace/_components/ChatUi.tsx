"use client"
import React, { useContext, useEffect, useRef, useState } from 'react'
import EmptyChatState from './EmptyChatState'
import { AssistantContext } from '@/context/AssistantContext';
import { Input } from '@/components/ui/input';
import { Loader2Icon, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';

interface Assistant {
    instruction: string;
    id: string;
    image: any;
    userInstruction: string;
    aiModelId: 1 | 2 | 3 | 4 | 5;
}

type MESSAGE = {
    role: string,
    content: string,
};

// Update these functions in your ChatUi.tsx file

const getStoredMessages = (assistantId: string): MESSAGE[] => {
    if (!assistantId) return []; // Safety check for undefined ID
    
    const key = `assistant-${assistantId}`;
    const storedData = localStorage.getItem(key);
    
    if (storedData) {
      try {
        const { messages, timestamp } = JSON.parse(storedData);
        const threeDays = 3 * 24 * 60 * 60 * 1000;
        
        if (Date.now() - timestamp < threeDays) {
          return messages;
        }
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Error parsing stored messages:', e);
      }
    }
    return [];
  };
  
  const storeMessages = (assistantId: string, messages: MESSAGE[]) => {
    if (!assistantId) return; // Safety check for undefined ID
    
    const key = `assistant-${assistantId}`;
    const data = {
      messages,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(data));
  };
// Default placeholder image to use when assistant image is not available
const DEFAULT_ASSISTANT_IMAGE = '/bug-fixer.avif'; // Update this path to your default image

function ChatUi() {
    const [input, setInput] = useState<string>('');
    const { assistant } = useContext(AssistantContext);
    const [messages, setMessages] = useState<MESSAGE[]>([]);
    const [loading, setLoading] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (assistant?.id) {
            const storedMessages = getStoredMessages(assistant.id);
            setMessages(storedMessages);
        } else {
            setMessages([]);
        }
    }, [assistant?.id]);

    useEffect(() => {
        if (assistant?.id && messages.length > 0) {
            storeMessages(assistant.id, messages);
        }
    }, [messages, assistant?.id]);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    const onSendMessage = async () => {
        if (!input.trim() || loading || !assistant) return;
        
        const userInput = input.trim();
        setInput('');
        setLoading(true);

        const newMessages = [
            ...messages,
            { role: 'user', content: userInput },
            { role: 'assistant', content: 'Loading...' }
        ];
        setMessages(newMessages);

        try {
            const providerMap = {
                1: "openai",
                2: "claude",
                3: "deepseek",
                4: "mistral",
                5: "gemini"
            };
            
            const response = await axios.post('/api/ai-model', {
                provider: providerMap[assistant.aiModelId as keyof typeof providerMap],
                messages: [
                    {
                        role: 'system',
                        content: `${assistant.instruction} ${assistant.userInstruction}`.trim()
                    },
                    ...messages.filter(m => m.role !== 'assistant'),
                    { role: 'user', content: userInput }
                ]
            });

            setMessages(prev => [
                ...prev.slice(0, -1),
                { role: 'assistant', content: response.data.response }
            ]);
        } catch (error) {
            setMessages(prev => [
                ...prev.slice(0, -1),
                { role: 'assistant', content: 'Error: Failed to get response' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Check if assistant exists before rendering chat messages
    const shouldShowEmptyState = !assistant || messages.length === 0;

    return (
        <div className="flex flex-col h-[calc(100vh-160px)] p-6 pb-0">
            {shouldShowEmptyState && <EmptyChatState />}
            
            <div 
                ref={chatRef}
                className="flex-1 overflow-y-auto scrollbar-hide pr-4 mb-4 space-y-4"
            >
                {messages.map((msg, index) => (
                    <div 
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[85%] flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                            {msg.role === 'assistant' && (
                                <Image 
                                    src={assistant?.image || DEFAULT_ASSISTANT_IMAGE}
                                    alt="Assistant"
                                    width={40}
                                    height={40}
                                    className="rounded-full object-cover w-10 h-10 flex-shrink-0"
                                />
                            )}
                            <div 
                                className={`p-3 rounded-lg ${
                                    msg.role === 'user' 
                                        ? 'bg-blue-100 dark:bg-blue-900 ml-12' 
                                        : 'bg-gray-100 dark:bg-gray-800 mr-12'
                                } break-words overflow-x-auto`}
                            >
                                {msg.content === 'Loading...' ? (
                                    <Loader2Icon className="animate-spin" />
                                ) : (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeHighlight]}
                                        components={{
                                            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mb-3" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="text-lg font-medium mb-2" {...props} />,
                                            p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                                            code: ({ node, className, ...props }) => (
                                                <code
                                                    className={`${className} p-2 rounded-md bg-gray-800 text-white block overflow-x-auto text-sm`}
                                                    {...props}
                                                />
                                            ),
                                            strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                                            em: ({ node, ...props }) => <em className="italic" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                                            li: ({ node, ...props }) => <li className="mb-2" {...props} />,
                                            table: ({ node, ...props }) => (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full border-collapse my-4" {...props} />
                                                </div>
                                            ),
                                            th: ({ node, ...props }) => (
                                                <th className="border-b dark:border-gray-700 p-2 text-left bg-gray-100 dark:bg-gray-700" {...props} />
                                            ),
                                            td: ({ node, ...props }) => (
                                                <td className="border-b dark:border-gray-700 p-2" {...props} />
                                            ),
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="sticky bottom-0 bg-background pt-4 border-t">
                <div className="flex gap-3 w-full max-w-4xl mx-auto">
                    <Input 
                        placeholder="Start Typing Here..."
                        value={input}
                        disabled={loading || !assistant}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
                        className="flex-1 rounded-full px-6 py-5 shadow-sm"
                    />
                    <Button 
                        onClick={onSendMessage}
                        disabled={loading || !assistant}
                        className="rounded-full h-12 w-12 p-3 shrink-0"
                    >
                        {loading ? (
                            <Loader2Icon className="animate-spin h-5 w-5" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ChatUi;