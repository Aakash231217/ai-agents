import { Popover } from '@/components/ui/popover'
import AiAssistantList from '@/services/AiAssistantList'
import { PopoverContent, PopoverTrigger } from '@radix-ui/react-popover'
import Image from 'next/image'
import React from 'react'

function AssistantAvatar({children,selectedImage}:any) {
  return (
    
  <Popover>
    <PopoverTrigger>{children}</PopoverTrigger>

        <PopoverContent>
            <div className='grid grid-cols-5 gap-2 '>
              {AiAssistantList.map((assistant, index) => (
                <Image
                  src={assistant.image}
                  alt={assistant.name}
                  key={index}
                  width={80}
                  height={80}
                  className='w-[30px] h-[30px] rounded-lg object-cover'
                  onClick={() => selectedImage(assistant.image)}
                />
              ))}
            </div>
        </PopoverContent>
  </Popover>
)
}

export default AssistantAvatar