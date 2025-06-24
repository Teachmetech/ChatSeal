import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  rooms: defineTable({
    name: v.optional(v.string()),
    passphraseRequired: v.boolean(),
    expiresAt: v.number(),
    salt: v.optional(v.bytes()), // Salt for key derivation
  }).index("by_expiresAt", ["expiresAt"]),

  messages: defineTable({
    roomId: v.id("rooms"),
    author: v.string(),
    content: v.bytes(), // Encrypted text OR encrypted filename
    iv: v.bytes(),
    isFile: v.boolean(),
    file: v.optional(
      v.object({
        storageId: v.id("_storage"),
        iv: v.bytes(), // IV for the file blob itself
        type: v.string(), // Mime type
      })
    ),
  }).index("by_roomId", ["roomId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
