"use client";
import { Button } from '@/components/ui/button';
import AiAssistantList from '@/services/AiAssistantList';
import React, { useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { BlurFade } from '@/components/magicui/blur-fade';
import { useConvex, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AuthContext } from '@/context/AuthContext';
import { Id } from '@/convex/_generated/dataModel';
import { Loader, Loader2Icon, Router } from 'lucide-react';
import { useRouter } from 'next/navigation';


export type ASSISTANT={
  id:number;
  name:string;
  title:string;
  image:string;
  instruction:string;
  userInstruction:string;
  sampleQuestions:string[];
  aiModelId?:string
}

function AIAssistants() {
  const router = useRouter();

  const [selectedAssistant, setSelectedAssistant]=useState<ASSISTANT[]>([]);
  const insertAssistant = useMutation(api.userAiAssistant.InsertSelectedAssistants)
  const {user}=useContext(AuthContext);
  const [loading,setLoading]=useState(false);
  const convex =  useConvex();
  useEffect(()=>{user && GetUserAssistants()},[user])
  const GetUserAssistants=async()=>{
    if (!user) return;
    const result = await convex.query(api.userAiAssistant.GetAllUserAssistants,{
      uid:user._id
    })
    if(result.length>0){
      //navigate to new screen;
      router.replace('/workspace');
      return 

    }
  }
  const onSelect=(assistant:ASSISTANT)=>{
      const item = selectedAssistant.find((item:ASSISTANT)=>item.id==assistant.id)
      if (item){
        setSelectedAssistant(selectedAssistant.filter((item:ASSISTANT)=>item.id!=assistant.id))
        return;
      }
      setSelectedAssistant(prev=>[...prev,assistant]);
    }
    const isAssistantSelected=(assistant:ASSISTANT)=>{
      const item = selectedAssistant.find((item:ASSISTANT)=>item.id==assistant.id)
      return item?true:false; 
    }

    const OnClickContinue=async ()=>{
      setLoading(true);
      if (!user || !user._id) {
        console.error("User is not logged in or missing ID");
        return;
      }
      
      const result = await insertAssistant({
        records: selectedAssistant,
        uid: user._id as Id<"users"> // Cast to the appropriate Convex ID type
      });
      setLoading(false);
      console.log(result);
    }
  return (
    <>
      <div className='px-10 mt-20 md:px-28 lg:px-36 xl:px-48'>
        <div className='flex justify-between items-center'>
          <div>
            <h2 className='text-3xl font-bold'>Welcome to the world of AI Assistants</h2>
            <p className='text-xl mt-2'>Choose your AI companion to simplify your tasks</p>
          </div>
        </div>

        <Button disabled={selectedAssistant?.length==0 || loading} onClick={OnClickContinue}>{loading && <Loader2Icon className='animate-spin'/>}Continue</Button>
      </div>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mt-5' >
        {AiAssistantList.map((assistant, index) => (
          <BlurFade key={assistant.image} delay={0.25+index*0.05} inView>
          <div key={index} className='hover:border p-3 rounded-xl hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer relative' 
          onClick={()=>onSelect(assistant)}>
            <Checkbox className='absolute m-2' checked={isAssistantSelected(assistant)}/>
            <Image src={assistant.image} alt={assistant.title} width={500} height={300}
            className='rounded-xl w-full h-[200px] object-cover' />
            <h2 className='text-center font-bold text-lg'>{assistant.name}</h2>

<h3 className='text-center text-gray-600 dark:text-gray-300'>{assistant.title}</h3>          </div>
</BlurFade>
        ))}
      </div>
    </>
  );
}

export default AIAssistants;