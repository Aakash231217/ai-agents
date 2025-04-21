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
    
    // Process each record and ensure it has a unique ID
    const recordsWithIds = records.map(record => {
      // If the record doesn't have an ID or has -1, generate a random positive ID
      if (!record.id || record.id === -1) {
        // Generate a random ID between 1 and 10000
        // You can adjust the range as needed
        const randomId = Math.floor(Math.random() * 10000) + 1;
        return { ...record, id: randomId };
      }
      return record;
    });
    
    // Insert the records with IDs
    const insertedIds = [];
    for (const record of recordsWithIds) {
      const id = await ctx.db.insert("userAiAssistants", {
        ...record,
        uid
      });
      insertedIds.push(id);
    }
    
    return insertedIds
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