import { Ctx, MessageType, quote } from "@mengkodingan/ckptw"; // Ensure you have the correct imports
import { DownloadableMessage } from "@whiskeysockets/baileys";
import { DatabaseHandler } from "../../db/DatabaseHandler";
import { isBotMuted } from "../../lib/main";

const dbHandler = new DatabaseHandler();

module.exports = {
    name: "retrieve",
    aliases: ["viewonce"],
    category: "Utils",
    code: async (ctx: Ctx) => {
        const userId =  ctx.sender?.jid!
          const userDocSnapshot = await dbHandler.getUser(userId);
 // Check if the bot is muted
 if (isBotMuted()) {
    await ctx.reply("The bot is currently muted and cannot process this command.");
    return;
}
      if (!userDocSnapshot.exists) {
        return ctx.reply("🟥 *User not found. Please write !register*"); // Removed unnecessary await
      }

        try {
            const quoted = ctx.quoted?.viewOnceMessageV2?.message; // Safely access the quoted message
            
            // Check if the quoted message exists
            if (!quoted) {
                return await ctx.reply(quote(`⚠️: No quoted message found.`));
            }

            const messageType = Object.keys(quoted)[0]; // Get the type of the quoted message
            
            // Ensure the message type is valid before downloading
            if (!messageType) {
                return await ctx.reply(quote(`⚠️: Invalid message type.`));
            }

            // Validate that the message type is one of the expected types
            if (!(messageType in MessageType)) {
                return await ctx.reply(quote(`⚠️: Unsupported message type.`));
            }

            // Cast messageType to the specific type that is expected
            const mediaMessageType = messageType as keyof typeof MessageType; // Use keyof to assert the type
            
            // Check if the specific message exists before trying to download it
            const messageToDownload = quoted[mediaMessageType];
            if (!messageToDownload) {
                return await ctx.reply(quote(`⚠️: No media found to download.`));
            }

            // Type assertion to DownloadableMessage
            const downloadableMessage = messageToDownload as DownloadableMessage;

            // Now you can safely call downloadContentFromMessage
            const media = await ctx.downloadContentFromMessage(downloadableMessage, mediaMessageType.slice(0, -7) as "image" | "video" | "audio" | "document" | "gif" | "ppic" | "ptt" | "sticker" | "thumbnail-document" | "thumbnail-image" | "thumbnail-video" | "thumbnail-link" | "ptv"); // Make sure to typecast to the expected types

            let buffer = Buffer.from([]);
            for await (const chunk of media) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // Check the type of the message and reply accordingly
            if (mediaMessageType === MessageType.imageMessage) {
                await ctx.reply({
                    image: buffer,
                });
            } else if (mediaMessageType === MessageType.videoMessage) {
                await ctx.reply({
                    video: buffer,
                });
            } else {
                await ctx.reply(quote(`⚠️: Unsupported message type.`));
            }
        } catch (error: any) {
            console.error(`Error:`, error);
            return await ctx.reply(quote(`⚠️: ${error.message}`));
        }
    }}