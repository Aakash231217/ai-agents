"use client"
import React from 'react'
import Header from './_components/Header';
import { GetAuthUserData } from '@/services/GlobalApi';
import { useRouter } from 'next/navigation';
function Provider({
    children,
}:Readonly<{
    children:React.ReactNode;}>) {
        const router=useRouter();
        const CheckUseAuth=async()=>{
            //get new access token
            const token=localStorage.getItem('user_token');
            const user=token && await GetAuthUserData(token);

            if(!user){
             router.replace('/sign-in');
             return;
        }
        try{
        }
        catch(e){
            
        }
    }
  return (

    <div>
        <Header/>
        {children}
        </div>
  )
}

export default Provider;