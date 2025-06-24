import { v } from "convex/values";
import {
  query,
  mutation,
  internalAction,
  internalQuery,
  internalMutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const createRoom = mutation({
  args: {
    name: v.optional(v.string()),
    passphraseRequired: v.boolean(),
    ttl: v.number(), // Time to live in milliseconds
    salt: v.optional(v.bytes()),
  },
  handler: async (ctx, args) => {
    const expiresAt = Date.now() + args.ttl;
    const roomId = await ctx.db.insert("rooms", {
      name: args.name,
      passphraseRequired: args.passphraseRequired,
      expiresAt,
      salt: args.salt,
    });
    return roomId;
  },
});

export const getRoom = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || room.expiresAt < Date.now()) {
      return null;
    }
    return {
      _id: room._id,
      _creationTime: room._creationTime,
      name: room.name,
      passphraseRequired: room.passphraseRequired,
      salt: room.salt,
    };
  },
});

export const sendMessage = mutation({
  args: {
    roomId: v.id("rooms"),
    author: v.string(),
    content: v.bytes(),
    iv: v.bytes(),
    isFile: v.boolean(),
    file: v.optional(
      v.object({
        storageId: v.id("_storage"),
        iv: v.bytes(),
        type: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || room.expiresAt < Date.now()) {
      if (args.isFile && args.file) {
        await ctx.storage.delete(args.file.storageId);
      }
      throw new Error("Room does not exist or has expired.");
    }
    await ctx.db.insert("messages", {
      roomId: args.roomId,
      author: args.author,
      content: args.content,
      iv: args.iv,
      isFile: args.isFile,
      ...(args.isFile && args.file ? { file: args.file } : {}),
    });
  },
});

export const getMessages = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      return [];
    }
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .order("asc")
      .collect();

    return Promise.all(
      messages.map(async (message) => {
        if (message.isFile && message.file) {
          const url = await ctx.storage.getUrl(message.file.storageId);
          return { ...message, url: url ?? null };
        }
        return { ...message, url: null };
      })
    );
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const clearAllMessages = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();

    await Promise.all(
      messages.map(async (message) => {
        if (message.isFile && message.file) {
          try {
            await ctx.storage.delete(message.file.storageId);
          } catch (error) {
            console.error(
              `Failed to delete file: ${message.file.storageId}`,
              error
            );
          }
        }
        await ctx.db.delete(message._id);
      })
    );
  },
});

export const deleteExpiredRooms = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredRooms = await ctx.runQuery(internal.chat.getExpiredRooms, {
      now,
    });

    for (const room of expiredRooms) {
      const messages = await ctx.runQuery(internal.chat.getMessagesForRoom, {
        roomId: room._id,
      });
      for (const message of messages) {
        if (message.isFile && message.file) {
          try {
            await ctx.storage.delete(message.file.storageId);
          } catch (error) {
            console.error(
              `Failed to delete file: ${message.file.storageId}`,
              error
            );
          }
        }
        await ctx.runMutation(internal.chat.deleteMessage, {
          messageId: message._id,
        });
      }
      await ctx.runMutation(internal.chat.deleteRoom, { roomId: room._id });
    }
  },
});

// Internal functions for the cron job
export const getExpiredRooms = internalQuery({
  args: { now: v.number() },
  handler: async (ctx, { now }) => {
    return await ctx.db
      .query("rooms")
      .withIndex("by_expiresAt", (q) => q.lt("expiresAt", now))
      .collect();
  },
});

export const getMessagesForRoom = internalQuery({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_roomId", (q) => q.eq("roomId", roomId))
      .collect();
  },
});

export const deleteMessage = internalMutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, { messageId }) => {
    await ctx.db.delete(messageId);
  },
});

export const deleteRoom = internalMutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    await ctx.db.delete(roomId);
  },
});
