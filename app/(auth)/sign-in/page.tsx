'use client'
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useGoogleLogin } from '@react-oauth/google';
import React, { useContext } from 'react';
import axios from 'axios';
import { GetAuthUserData } from '@/services/GlobalApi';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AuthContext } from '@/context/AuthContext';
function SignIn() {
    const CreateUser = useMutation(api.users.CreateUser);
    const [user,setUser]=useContext(AuthContext);
    const googleLogin = useGoogleLogin({
      onSuccess:async(tokenResponse)=>{
        console.log(tokenResponse);
        if(typeof window !== 'undefined'){
            localStorage.setItem('user_token',tokenResponse.access_token!);

        }
        const user=await GetAuthUserData(tokenResponse.access_token!);
        //save user info
        const result = await CreateUser({
            name: user.name,
            email: user.email,
            picture: user.picture,

        })
        setUser(result);
      },
      onError:errorResponse=>console.log(errorResponse)
    })
  return (
    <div className='flex items-center justify-center h-screen bg-gray-100'>
      <div className='flex flex-col items-center p-10 bg-white rounded-lg shadow-md w-96'>
        <Image 
          src={'/logo.svg'} 
          alt='logo'
          width={80}
          height={80}
          className="mb-6"
        />
        <h2 className='text-xl font-medium mb-5 text-gray-700'>Sign In To Runigene - Your Personal Agent</h2>
        <Button onClick={()=>googleLogin()} className="bg-black text-white w-full py-2 rounded hover:bg-gray-800">
          Sign in with Gmail
        </Button>
      </div>
    </div>
  )
}

export default SignIn;