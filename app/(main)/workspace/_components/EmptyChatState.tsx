"use client"
import { SparklesText } from '@/components/magicui/sparkles-text'
import { AssistantContext } from '@/context/AssistantContext';
import React, { useContext } from 'react'

function EmptyChatState() {
        const {assistant,setAssistant}=useContext(AssistantContext);
    
  return (
    <div className='flex flex-col items-center'>
   <SparklesText className='text-4xl text-center'>How can I Assist You ?</SparklesText>
   <div className='mt-7'>
            {assistant?.sampleQuestions.map((suggestion:string,index:number)=>(
                <div key={index}>
                    <h2 className='p-4 text-lg border mt-1 rounded-xl hover:bg-gray-700 cursor-pointer flex items-center'>{suggestion}</h2></div>
            ))}

        </div>
    </div>
  )
}

export default EmptyChatState