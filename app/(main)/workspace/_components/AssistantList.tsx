"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthContext } from '@/context/AuthContext';
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react'
import { ASSISTANT } from '../../ai-assistants/page';
import Image from 'next/image';
import { AssistantContext } from '@/context/AssistantContext';

export default function AssistantList() {
    const router = useRouter();
    const {user}=useContext(AuthContext);
    const convex =  useConvex();
    const [assistantList, setAssistantList]=useState<ASSISTANT[]>([])
    const {assistant,setAssistant}=useContext(AssistantContext);
    useEffect(()=>{user && GetUserAssistants()},[user])
      const GetUserAssistants=async()=>{
        if (!user) return;
        const result = await convex.query(api.userAiAssistant.GetAllUserAssistants,{
          uid:user._id
        })
        setAssistantList(result);
      }
  return (
    <div className='p-5 bg-secondary border-r-[1px] h-screen relative'>
        <h2 className="font-bold text-lg"> Your Personal AI Assistant</h2>
      <Button className='w-full mt-3'>+ ADD New Assistant</Button>
     <Input className='bg-white mt-3 ' placeholder='Search Assistant' />    
    
    <div className='mt-5'>
        {assistantList.map((assistant_, index) => (
            <div key={index} className={`p-3 flex gap-3 items-center hover:bg-gray-400 hover:dark:bg-slate-700 rounded-xl cursor-pointer mt-2
                ${assistant_.id==assistant?.id && 'bg-gray-200'}
                `}
            onClick={()=>setAssistant(assistant_)} >
                <Image src={assistant_.image} alt={assistant_.name} width={50} height={50} className='rounded-lg w-[60px] h-[60px] object-cover'/>
             <div>
                <h2 className='font-bold'>{assistant_.name}</h2>
                <h2 className='text-gray-300 text-sm dark-text-gray'>{assistant_.title}</h2>
             </div>
            </div>
        ))}
    </div>
    <div className='absolute bottom-10 flex gap-3 items-center hover:bg-gray-200 w-[87%] p-2 rounded-xl cursor-pointer'>
        <Image src={user?.picture || "/default-user.png"} alt='user' width={35} height={35}
        className='rounded full'/>
        <div>
            <h2 className='font-bold'>{user?.name}</h2>
            <h2 className='text-gray-400'>{user?.orderId?"ProPlan":"Free Plan"}</h2>
            </div>
    </div>
    </div>
  )
}
