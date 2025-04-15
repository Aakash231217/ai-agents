"use client"
import { Id } from '@/convex/_generated/dataModel';
import { createContext, useState, Dispatch, SetStateAction } from 'react';

interface UserType {
  _id: Id<"users">;
  name?: string;
  email?: string;
  picture?: string;
  credits?: number;
  orderId?: string;
}

export const AuthContext = createContext<{
  user: UserType | null;
  setUser: Dispatch<SetStateAction<UserType | null>>;
}>({
  user: null,
  setUser: () => {},
});