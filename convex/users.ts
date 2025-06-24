import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const updateMyNickname = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    await ctx.db.patch(userId, { name });
  },
});

export const list = query({
  args: { userIds: v.array(v.id("users")) },
  handler: async (ctx, { userIds }) => {
    const users = await Promise.all(
      userIds.map((userId) => ctx.db.get(userId))
    );
    return users.filter((u) => u !== null);
  },
});
