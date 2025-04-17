"use client"
import React, { useContext, useEffect, useRef, useState } from 'react'
import EmptyChatState from './EmptyChatState'
import { AssistantContext } from '@/context/AssistantContext';
import { Input } from '@/components/ui/input';
import { Loader2Icon, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface Assistant {
    instruction: string;
    id: unknown;
    image: any;
    userInstruction: string;
    aiModelId: 1 | 2 | 3 | 4 | 5;
}
import AiModelOptions from '@/services/AiModelOptions';
import axios from 'axios';

type MESSAGE = {
    role: string,
    content: string,
};

function ChatUi() {
    const [input,setInput]=useState<string>('');
    const { assistant,setAssistant } = useContext(AssistantContext) as { assistant: Assistant, setAssistant: React.Dispatch<React.SetStateAction<Assistant>> };
    const [messages,setMessages]=useState<MESSAGE[]>([]);
    const [loading,setLoading]=useState(false);
    const chatRef=useRef<any>(null)
    // In ChatUi.tsx
    useEffect(()=>{
    if(chatRef.current){
        chatRef.current.scrollTop=chatRef.current.scrollHeight;
    }
    },[messages])

useEffect(()=>{
   setMessages([]);
},[assistant?.id])

const onSendMessage = async () => {
    setLoading(true);
    // Capture input value before clearing
    const userInput = input;
    
    // Map ID to provider name
    const providerMap = {
        1: "openai",
        2: "claude", 
        3: "deepseek",
        4: "mistral",
        5: "gemini"
    };
    
    // Get the provider name using the mapping
    const provider = providerMap[assistant.aiModelId] || "openai"; // Default to OpenAI
    
    // Create a new message with instructions included
    const userMessage = {
        role: 'user',
        content: userInput
    };
    
    // Update UI immediately
    setMessages(prev => [...prev, userMessage, { role: 'assistant', content: 'Loading...' }]);
    setInput('');  // Clear input after capturing
    
    try {
        console.log("Sending request with provider:", provider);
        
        // Format messages array to include all previous messages plus system instructions
        const formattedMessages = [
            // Include system message with instructions if available
            ...(assistant?.instruction ? [{
                role: 'system',
                content: assistant.instruction + (assistant.userInstruction ? " " + assistant.userInstruction : "")
            }] : []),
            // Include previous conversation
            ...messages.slice(0, -1), // All messages except the loading one
            // Add the new user message
            userMessage
        ];
        
        const result = await axios.post('/api/ai-model', {
            provider: provider,
            messages: formattedMessages
        });
        
        setLoading(false);
        setMessages(prev => prev.slice(0, -1)); // Remove loading message
        setMessages(prev => [...prev, { role: 'assistant', content: result.data.response }]);
    } catch (error) {
        console.error('API Error:', error);
        setLoading(false);
        // Replace loading message with error message
        setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: 'Failed to get response. Please try again.' }]);
    }
}
  return (
    <div className='mt-20 p-6 relative h-[88vh]'>
        {messages?.length==0 && <EmptyChatState/>}
        <div ref={chatRef}className='h-[73vh] overflow-scroll scrollbar-hide'>
            {messages.map((msg,index)=>(
                <div key={index}
                className={`flex ${msg.role=='user'?'justify-end':'justify-start'} gap-2 p-2`}>
                    <div className='flex gap-3'>
                        {msg.role=='assistant' && <Image src={assistant?.image} alt='Assistant'
                        width={100}
                        height={100}
                        className='w-[30px] h-[30px] rounded-full object-cover'/>}
                        <div className={`p-3
                            ${msg.role=='user'?'bg-blue-200 text-black rounded-br-none rounded-tl-xl':'bg-gray-200 dark:bg-slate-400 text-black rounded-bl-none rounded-tr-xl'}`}>
                            {loading && messages?.length-1==index && <Loader2Icon className='animate-spin'/>}
                            {msg.content}
                            </div>
                        </div>

                    </div>
            ))}
        </div>
        <div className='flex justify-between p-5 gap-5 absolute bottom-5 w-[89%]'>
            <Input placeholder="Start Typing Here..."
            value={input}
            disabled={loading}
            onChange={(event)=>setInput(event.target.value)}
            onKeyPress={(e)=>e.key==='Enter' && onSendMessage()}/>
            <Button disabled={loading}>
                <Send/>
            </Button>
        </div>
    </div>
  )
}

export default ChatUi