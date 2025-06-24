import { mutation, query } from "./_generated/server";
import { components } from "./_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { Presence } from "@convex-dev/presence";

export const presence = new Presence(components.presence);

export const getUserId = query({
  args: {},
  handler: async (ctx) => {
    return await getAuthUserId(ctx);
  },
});

export const heartbeat = mutation({
  args: {
    roomId: v.string(),
    userId: v.string(),
    sessionId: v.string(),
    interval: v.number(),
  },
  handler: async (ctx, { roomId, userId, sessionId, interval }) => {
    // Skip validation for dummy/placeholder requests during auth loading
    if (roomId === "dummy_room" || userId === "dummy000000000000000000000000000") {
      // Return dummy tokens for dummy calls to satisfy the expected return type
      return {
        roomToken: "dummy_room_token",
        sessionToken: "dummy_session_token"
      };
    }

    const authUserId = await getAuthUserId(ctx);
    if (authUserId !== userId as Id<"users">) {
      throw new Error("Not authorized");
    }
    return await presence.heartbeat(ctx, roomId, userId, sessionId, interval);
  },
});

export const list = query({
  args: { roomToken: v.string() },
  handler: async (ctx, { roomToken }) => {
    const presenceList = await presence.list(ctx, roomToken);
    const listWithUserInfo = await Promise.all(
      presenceList.map(async (entry) => {
        const user = await ctx.db.get(entry.userId as Id<"users">);
        return {
          ...entry,
          data: {
            name: user?.name,
            image: user?.image,
          },
        };
      })
    );
    return listWithUserInfo;
  },
});

export const disconnect = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    return await presence.disconnect(ctx, sessionToken);
  },
});
