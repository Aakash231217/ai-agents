import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const CreateUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    picture: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUsers = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("email"), args.email))
      .collect();
    
    // If user doesn't exist, create a new one
    if (existingUsers.length === 0) {
      const data = {
        name: args.name,
        email: args.email,
        picture: args.picture,
        credits: 5000,
      };
      await ctx.db.insert("users", data);
      return data;
    }
    
    // Return the existing user
    return existingUsers[0];
  }
});