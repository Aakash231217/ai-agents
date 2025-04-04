"use client"    
import React,{useContext} from 'react'
import { AuthContext } from '@/context/AuthContext';
import Image from 'next/image'
function Header() {
    const {user}=useContext(AuthContext);

  return user &&(
    <div className="p-3 shadow-sm">
        <Image src={'/logo.svg'} alt='logo'
        width={50}
        height={50}
        />

        <Image src={user?.image} alt='logo'
        width={40}
        height={40}/>
    </div>
  )
}

export default Header