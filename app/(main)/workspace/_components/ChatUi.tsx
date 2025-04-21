"use client"
import React, { useContext, useEffect, useRef, useState } from 'react'
import EmptyChatState from './EmptyChatState'
import { AssistantContext } from '@/context/AssistantContext';
import { Input } from '@/components/ui/input';
import { Loader2Icon, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import axios from 'axios';

interface Assistant {
    instruction: string;
    id: string; // Ensure ID is string type
    image: any;
    userInstruction: string;
    aiModelId: 1 | 2 | 3 | 4 | 5;
}

type MESSAGE = {
    role: string,
    content: string,
};

// LocalStorage helper functions
const getStoredMessages = (assistantId: string): MESSAGE[] => {
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
  const key = `assistant-${assistantId}`;
  const data = {
    messages,
    timestamp: Date.now()
  };
  localStorage.setItem(key, JSON.stringify(data));
};

function ChatUi() {
    const [input, setInput] = useState<string>('');
    const { assistant } = useContext(AssistantContext);
    const [messages, setMessages] = useState<MESSAGE[]>([]);
    const [loading, setLoading] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);

    // Load messages when assistant changes
    useEffect(() => {
        if (assistant?.id) {
            const storedMessages = getStoredMessages(assistant.id);
            setMessages(storedMessages);
        } else {
            setMessages([]);
        }
    }, [assistant?.id]); // Reload when ID changes

    // Save messages when they change
    useEffect(() => {
        if (assistant?.id && messages.length > 0) {
            storeMessages(assistant.id, messages);
        }
    }, [messages, assistant?.id]);

    // Scroll handling
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    const onSendMessage = async () => {
        if (!input.trim() || loading) return;
        
        const userInput = input.trim();
        setInput('');
        setLoading(true);

        // Update local state immediately
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

            // Update with actual response
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

    return (
        <div className='mt-20 p-6 relative h-[88vh]'>
            {messages.length === 0 && <EmptyChatState />}
            
            <div ref={chatRef} className='h-[73vh] overflow-y-auto scrollbar-hide'>
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2 p-2`}>
                        <div className='flex gap-3'>
                            {msg.role === 'assistant' && (
                                <Image 
                                    src={assistant.image}
                                    alt='Assistant'
                                    width={40}
                                    height={40}
                                    className='rounded-full object-cover w-10 h-10'
                                />
                            )}
                            <div className={`p-3 max-w-3xl ${
                                msg.role === 'user' 
                                    ? 'bg-blue-200 text-black rounded-br-none rounded-tl-xl' 
                                    : 'bg-gray-200 dark:bg-slate-400 text-black rounded-bl-none rounded-tr-xl'
                            }`}>
                                {msg.content === 'Loading...' ? (
                                    <Loader2Icon className='animate-spin' />
                                ) : (
                                    msg.content
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className='flex justify-between p-5 gap-5 absolute bottom-12 w-[89%]'>
                <Input 
                    placeholder="Start Typing Here..."
                    value={input}
                    disabled={loading}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
                />
                <Button 
                    onClick={onSendMessage}
                    disabled={loading}
                >
                    {loading ? <Loader2Icon className='animate-spin' /> : <Send />}
                </Button>
            </div>
        </div>
    );
}

export default ChatUi;