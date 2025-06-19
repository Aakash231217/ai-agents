"use client"
import React, { useContext, useEffect, useRef, useState } from 'react'
import EmptyChatState from './EmptyChatState'
import { AssistantContext } from '@/context/AssistantContext';
import { Input } from '@/components/ui/input';
import { Loader2Icon, Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Assistant {
    instruction: string;
    id: string;
    image: any;
    userInstruction: string;
    aiModelId: 1 | 2 | 3 ;
}

type MESSAGE = {
    role: string,
    content: string,
};

const VOICE_OPTIONS = {
  male: [
    { name: "Alex", pitch: 0.8, rate: 1.0 },
    { name: "Archiee", pitch: 0.7, rate: 0.9 },
    { name: "Levi", pitch: 0.6, rate: 0.95 },
    { name: "Harmozi", pitch: 0.5, rate: 0.93 }

  ],
  female: [
    { name: "Lisa", pitch: 1.2, rate: 1.0 },
    { name: "Mahira", pitch: 1.3, rate: 1.05 },
    { name: "Heena", pitch: 1.1, rate: 0.95 },
    { name: "Shalini", pitch: 1.4, rate: 1.03 }

  ]
};

const getStoredMessages = (assistantId: string): MESSAGE[] => {
    if (!assistantId) return [];
    
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
    if (!assistantId) return;
    
    const key = `assistant-${assistantId}`;
    const data = {
      messages,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(data));
};

const DEFAULT_ASSISTANT_IMAGE = '/bug-fixer.avif';

function ChatUi() {
    const [input, setInput] = useState<string>('');
    const { assistant } = useContext(AssistantContext);
    const [messages, setMessages] = useState<MESSAGE[]>([]);
    const [loading, setLoading] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);
    
    // Speech state management
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male');
    const [selectedVoice, setSelectedVoice] = useState<any>(null);
    const [autoSpeak, setAutoSpeak] = useState(true);
    const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            
            recognitionRef.current.onresult = (event: any) => {
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0])
                    .map((result) => result.transcript)
                    .join('');
                setInput(transcript);
            };
            
            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event);
                setIsListening(false);
            };
        }

        selectRandomVoice(voiceGender);
        
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    useEffect(() => {
        selectRandomVoice(voiceGender);
    }, [voiceGender]);

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
    
    const selectRandomVoice = (gender: 'male' | 'female') => {
        const voices = VOICE_OPTIONS[gender];
        const randomIndex = Math.floor(Math.random() * voices.length);
        setSelectedVoice(voices[randomIndex]);
    };
    
    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition not supported");
            return;
        }
        
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };
    
    const speakText = (text: string) => {
        if (!window.speechSynthesis) return;
        
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        const cleanText = text
            .replace(/```[\s\S]*?```/g, "Code block removed for speech.")
            .replace(/`([^`]+)`/g, "$1")
            .replace(/\*\*([^*]+)\*\*/g, "$1")
            .replace(/\*([^*]+)\*/g, "$1")
            .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
            .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{2100}-\u{214F}]/gu, "");

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = selectedVoice.rate;
        utterance.pitch = selectedVoice.pitch;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            setCurrentUtterance(null);
        };
        utterance.onerror = () => {
            setIsSpeaking(false);
            setCurrentUtterance(null);
        };

        setCurrentUtterance(utterance);
        window.speechSynthesis.speak(utterance);
    };
    
    const stopSpeaking = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setCurrentUtterance(null);
        }
    };

    const onSendMessage = async () => {
        if (!input.trim() || loading || !assistant) return;
        
        const userInput = input.trim();
        setInput('');
        setLoading(true);
        
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }

        const newMessages = [
            ...messages,
            { role: 'user', content: userInput },
            { role: 'assistant', content: 'Loading...' }
        ];
        setMessages(newMessages);

        try {
            // Handle both numeric IDs and string model names
            let provider = "openai"; // Default provider
            
            if (typeof assistant.aiModelId === 'number') {
                // Handle numeric model ID (1-5)
                const providerMap = { 1: "openai", 2: "claude", 3: "gemini"};
                provider = providerMap[assistant.aiModelId as keyof typeof providerMap] || "openai";
            } else if (typeof assistant.aiModelId === 'string') {
                // Handle string model name
                const modelNameMap: Record<string, string> = {
                    "OpenAI": "openai",
                    "Claude": "claude",
                    "Google:Gemini": "gemini"
                };
                provider = modelNameMap[assistant.aiModelId] || "openai";
            }
            
            console.log("Using AI provider:", provider, "(aiModelId:", assistant.aiModelId, ")");

            // FIX: Use full message history except the last 'Loading...' placeholder
            const filteredMessages = [
                { role: 'system', content: `${assistant.instruction} ${assistant.userInstruction}`.trim() },
                ...[...messages, { role: 'user', content: userInput }]
                    .filter(m => m.content !== 'Loading...')
            ];
            
            const response = await axios.post('/api/ai-model', {
                provider,
                messages: filteredMessages
            });
            
            const assistantResponse = response.data.response;
            
            setMessages(prev => [
                ...prev.slice(0, -1),
                { role: 'assistant', content: assistantResponse }
            ]);
            
            if (autoSpeak) {
                speakText(assistantResponse);
            }
            
        } catch (error) {
            const errorMessage = 'Serving another people right now !! Will be back ASAP';
            setMessages(prev => [
                ...prev.slice(0, -1),
                { role: 'assistant', content: errorMessage }
            ]);
            if (autoSpeak) {
                speakText(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

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
                                <div className="flex flex-col items-center gap-1">
                                    <Image 
                                        src={assistant?.image || DEFAULT_ASSISTANT_IMAGE}
                                        alt="Assistant"
                                        width={40}
                                        height={40}
                                        className="rounded-full object-cover w-10 h-10 flex-shrink-0"
                                    />
                                    {msg.content !== 'Loading...' && (
                                        <Button
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6"
                                            onClick={() => speakText(msg.content)}
                                        >
                                            <Volume2 size={16} />
                                        </Button>
                                    )}
                                </div>
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
                <div className="flex flex-col gap-3 w-full max-w-4xl mx-auto">
                    <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-2">
                            <Select 
                                value={voiceGender} 
                                onValueChange={(val) => setVoiceGender(val as 'male' | 'female')}
                            >
                                <SelectTrigger className="w-32 h-8">
                                    <SelectValue placeholder="Voice Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                            {selectedVoice && (
                                <span className="text-xs text-gray-500">{selectedVoice.name}</span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                <Button
                                    variant={autoSpeak ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setAutoSpeak(!autoSpeak)}
                                    className="h-8"
                                >
                                    {autoSpeak ? (
                                        <><Volume2 className="h-4 w-4 mr-2" />On</>
                                    ) : (
                                        <><VolumeX className="h-4 w-4 mr-2" />Off</>
                                    )}
                                </Button>
                            </div>
                            
                            {isSpeaking && (
                                <Button 
                                    variant="outline"
                                    size="sm"
                                    onClick={stopSpeaking}
                                    className="h-8"
                                >
                                    <VolumeX className="h-4 w-4 mr-2" />
                                    Stop
                                </Button>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex gap-3 w-full">
                        <Input 
                            placeholder="Start Typing Here..."
                            value={input}
                            disabled={loading || !assistant}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
                            className="flex-1 rounded-full px-6 py-5 shadow-sm"
                        />
                        
                        <Button 
                            onClick={toggleListening}
                            disabled={loading || !assistant}
                            variant={isListening ? "destructive" : "outline"}
                            className="rounded-full h-12 w-12 p-3 shrink-0"
                        >
                            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        </Button>
                        
                        <Button 
                            onClick={onSendMessage}
                            disabled={loading || !assistant || !input.trim()}
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
        </div>
    );
}

export default ChatUi;
