'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthContext } from '@/context/AuthContext';
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react'
import Image from 'next/image';
import { AssistantContext } from '@/context/AssistantContext';
import { BlurFade } from '@/components/magicui/blur-fade';
import AddNewAssistant from './AddNewAssistant';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';

// Define the ASSISTANT type properly
export type ASSISTANT = {
    _id: string; // Preserve the original Convex ID
    id: number;
    name: string;
    title: string;
    image: string;
    instruction: string;
    userInstruction: string;
    aiModelId?: string;
    sampleQuestions: string[];
};

export default function AssistantList() {
    const router = useRouter();
    // Define the expected AuthContext type
    type AuthContextType = {
        user: {
            _id: string;
            name?: string;
            picture?: string;
            orderId?: string;
            // add other user properties as needed
        } | null;
        // add other AuthContext properties if needed
    };
    
        const { user } = useContext(AuthContext);
    const convex = useConvex();
    const [assistantList, setAssistantList] = useState<ASSISTANT[]>([]);
    const [filteredList, setFilteredList] = useState<ASSISTANT[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const {assistant, setAssistant} = useContext(AssistantContext);
    
    // Load assistants when user or assistant changes
    useEffect(() => {
        user && GetUserAssistants();
    }, [user, assistant]);
    
    // Filter assistants when search query changes
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredList(assistantList);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredList(
                assistantList.filter(
                    (item) => 
                        item.name.toLowerCase().includes(query) || 
                        item.title.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, assistantList]);
    
    // Fetch assistants and deduplicate them
    const GetUserAssistants = async () => {
        if (!user) return;
        try {
            const result = await convex.query(api.userAiAssistant.GetAllUserAssistants, {
                uid: user._id
            });
            
            console.log("Raw assistants from DB:", result);
            
            // Process and deduplicate assistants
            const processedAssistants = result.map((item: any) => ({
                _id: item._id, // Keep the original Convex ID
                id: item.id,
                name: item.name,
                title: item.title,
                image: item.image || item.logo || "", // Use image, fallback to logo if needed
                instruction: item.instruction,
                userInstruction: item.userInstruction || "",
                aiModelId: item.aiModelId || "OpenAI",
                sampleQuestions: Array.isArray(item.sampleQuestions)
                    ? item.sampleQuestions.map(String)
                    : [],
            }));
            
            // Deduplicate by name
            const uniqueAssistants = processedAssistants.reduce((acc: ASSISTANT[], current: ASSISTANT) => {
                const existingIndex = acc.findIndex(item => item.name === current.name);
                if (existingIndex === -1) {
                    acc.push(current);
                }
                return acc;
            }, []);
            
            setAssistantList(uniqueAssistants);
            setFilteredList(uniqueAssistants);
        } catch (error) {
            console.error("Error fetching assistants:", error);
        }
    };

    return (
        <div className='p-5 bg-secondary border-r-[1px] h-full flex flex-col'>
            <h2 className="font-bold text-lg">Your Personal AI Assistant</h2>
            
            <AddNewAssistant onAssistantAdded={GetUserAssistants}>
                <Button className='w-full mt-3'>+ ADD New Assistant</Button>
            </AddNewAssistant>
            
            {/* Search with icon */}
            <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                    className='bg-white pl-10' 
                    placeholder='Search Assistant' 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Assistants list with scrolling */}
            <ScrollArea className="flex-1 mt-5 pr-2 -mr-2">
                {filteredList.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                        {searchQuery ? 'No assistants match your search' : 'No assistants yet'}
                    </div>
                ) : (
                    <div className='space-y-2'>
                        {filteredList.map((assistant_, index) => (
                            <BlurFade key={assistant_._id || index} delay={0.25 + index * 0.05} inView>
                                <div
                                    className={`p-3 flex gap-3 items-center hover:bg-gray-400/20 dark:hover:bg-slate-700/70 rounded-xl cursor-pointer transition-colors
                                    ${assistant_._id === assistant?._id ? 'bg-gray-200 dark:bg-slate-700' : ''}`}
                                    onClick={() => {
                                        console.log("Setting assistant:", assistant_);
                                        setAssistant(assistant_);
                                    }}
                                >
                                    <Image
                                        src={assistant_.image}
                                        alt={assistant_.name}
                                        width={50}
                                        height={50}
                                        className='rounded-lg w-[60px] h-[60px] object-cover'
                                    />
                                    <div>
                                        <h2 className='font-bold'>{assistant_.name}</h2>
                                        <h2 className='text-gray-500 text-sm dark:text-gray-400'>{assistant_.title}</h2>
                                    </div>
                                </div>
                            </BlurFade>
                        ))}
                    </div>
                )}
            </ScrollArea>
            
            {/* User profile at bottom with fixed positioning */}
            <div className='mt-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
                <div className='flex gap-3 items-center hover:bg-gray-200 dark:hover:bg-gray-800 p-3 rounded-xl cursor-pointer transition-colors'>
                    <Image
                        src={user?.picture ?? "/default-user.png"}
                        alt='user'
                        width={40}
                        height={40}
                        className='rounded-full'
                    />
                    <div>
                        <h2 className='font-bold'>{user?.name || 'User'}</h2>
                        <h2 className='text-gray-500 dark:text-gray-400 text-sm'>{user?.orderId ? "Pro Plan" : "Free Plan"}</h2>
                    </div>
                </div>
            </div>
        </div>
    );
}