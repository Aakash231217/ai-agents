import {v} from "convex/values";
import {mutation, query} from "./_generated/server";

export const InsertSelectedAssistants = mutation({
  args: {
    records: v.array(v.any()),
    uid: v.string()
  },
  handler: async (ctx, args) => {
    const records = args.records;
    const uid = args.uid;
    
    // First, get the highest existing ID to avoid conflicts
    const allAssistants = await ctx.db.query("userAiAssistants").collect();
    
    // Find the highest ID currently in use
    let highestId = 0;
    for (const assistant of allAssistants) {
      if (typeof assistant.id === 'number' && assistant.id > highestId) {
        highestId = assistant.id;
      }
    }
    
    // Insert the records with sequential IDs starting after the highest
    const insertedIds = [];
    for (const record of records) {
      // Force a new ID for each record, incrementing from highest
      highestId += 1;
      
      // Create a clean record with the new ID
      const newRecord = {
        ...record,
        id: highestId,
        uid
      };
      
      // Remove any _id field if it exists (to avoid conflicts)
      if (newRecord._id) {
        delete newRecord._id;
      }
      
      const id = await ctx.db.insert("userAiAssistants", newRecord);
      insertedIds.push(id);
    }
    
    return insertedIds;
    }
})

export const GetAllUserAssistants=query({
    args:{
        uid:v.id('users')
    },
    handler:async(ctx,args)=>{
        const result= await ctx.db.query('userAiAssistants').filter(q=>q.eq(q.field('uid'),args.uid)).collect();
        return result;
    
    }
})

// Updated mutation function that accepts the ID in a more flexible way
export const UpdateUserAssistant = mutation({
    args: {
      id: v.id("userAiAssistants"),
      userInstruction: v.string(),
      aiModelId: v.string()
    },
    handler: async (ctx, args) => {
      try {
        const result = await ctx.db.patch(args.id, {
          aiModelId: args.aiModelId,
          userInstruction: args.userInstruction
        });
        return result;
      } catch (error) {
        console.error("Error in UpdateUserAssistant:", error);
        throw error;
      }
    }
  });


  export const DeleteAssistant=mutation({
    args:{
        id:v.id('userAiAssistants')
    },
    handler:async(ctx,args)=>{
        await ctx.db.delete(args.id);
    }
  })