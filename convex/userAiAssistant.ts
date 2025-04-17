import {v} from "convex/values";
import {mutation, query} from "./_generated/server";

export const InsertSelectedAssistants=mutation({
    args:{
        records:v.any(),
        uid:v.id('users')
    },
    handler:async(ctx,args)=>{
       const insertedIds = await Promise.all(
        args.records.map(async(record:any)=>
        await ctx.db.insert('userAiAssistants',{
            ...record,
            aiModelId:'OpenAI',
            uid:args.uid
        }))
       )
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