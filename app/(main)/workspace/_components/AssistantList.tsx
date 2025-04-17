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
    const {user} = useContext(AuthContext);
    const convex = useConvex();
    const [assistantList, setAssistantList] = useState<ASSISTANT[]>([]);
    const {assistant, setAssistant} = useContext(AssistantContext);
    
    useEffect(() => {
        user && GetUserAssistants();
    }, [user, assistant]);
    
    const GetUserAssistants = async () => {
        if (!user) return;
        try {
            const result = await convex.query(api.userAiAssistant.GetAllUserAssistants, {
                uid: user._id
            });
            
            console.log("Raw assistants from DB:", result);
            
            // Keep the original _id from Convex and also maintain the numeric id field
            setAssistantList(
                result.map((item: any) => ({
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
                }))
            );
        } catch (error) {
            console.error("Error fetching assistants:", error);
        }
    };

    return (
        <div className='p-5 bg-secondary border-r-[1px] h-screen relative'>
            <h2 className="font-bold text-lg">Your Personal AI Assistant</h2>
            <AddNewAssistant>
            <Button className='w-full mt-3'>+ ADD New Assistant</Button>

            </AddNewAssistant>
            <Input className='bg-white mt-3' placeholder='Search Assistant' />

            <div className='mt-5'>
                {assistantList.map((assistant_, index) => (
                    <BlurFade key={assistant_._id} delay={0.25 + index * 0.05} inView>
                        <div
                            className={`p-3 flex gap-3 items-center hover:bg-gray-400 hover:dark:bg-slate-700 rounded-xl cursor-pointer mt-2
                            ${assistant_._id === assistant?._id && 'bg-gray-200'}`}
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
                                <h2 className='text-gray-300 text-sm dark:text-gray-400'>{assistant_.title}</h2>
                            </div>
                        </div>
                    </BlurFade>
                ))}
            </div>
            
            <div className='absolute bottom-10 flex gap-3 items-center hover:bg-gray-200 w-[87%] p-2 rounded-xl cursor-pointer'>
                <Image
                    src={user?.picture ?? "/default-user.png"}
                    alt='user'
                    width={35}
                    height={35}
                    className='rounded-full'
                />
                <div>
                    <h2 className='font-bold'>{user?.name}</h2>
                    <h2 className='text-gray-400'>{user?.orderId ? "Pro Plan" : "Free Plan"}</h2>
                </div>
            </div>
        </div>
    );
}