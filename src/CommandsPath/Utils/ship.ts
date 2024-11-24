import { Ctx } from "@mengkodingan/ckptw";
import mime from 'mime-types';
import axios from 'axios';
import { DatabaseHandler } from "../../db/DatabaseHandler";
import { isBotMuted } from "../../lib/main";

const dbHandler = new DatabaseHandler();

module.exports = {
  name: "ship",
  category: "Fun",
  code: async (ctx: Ctx) => {
    const userId = ctx._sender?.jid!
 // Check if the bot is muted
 if (isBotMuted()) {
  await ctx.reply("The bot is currently muted and cannot process this command.");
  return;
}
    const userDocSnapshot = await dbHandler.getUser(userId);

            if (!userDocSnapshot.exists) {
              return ctx.reply("🟥 *User not found. Please write !register*"); // Removed unnecessary await
            }
    // Default profile picture URL if no profile is available
    const defaultProfilePic = 'https://i.ibb.co/3Fh9V6p/avatar-contact.png';

    // Determine target user based on quoted message or mentions
    let targetUserId = userId;

    if (ctx.quoted) {
      const quotedParticipant = ctx._msg.message?.extendedTextMessage?.contextInfo?.participant;
      if (quotedParticipant) {
        targetUserId = quotedParticipant; // The JID of the quoted message's sender
      }
    } else {
      // Fallback to mentioned JIDs if no quoted message
      const mentionedJids = ctx.getMentioned();
      if (mentionedJids && mentionedJids.length > 0) {
        targetUserId = mentionedJids[0];
      }
    }

    // Fetch the profile pictures for both users
    let profileUrl1: string = defaultProfilePic;
    let profileUrl2: string = defaultProfilePic;

    try {
      profileUrl1 = await ctx._client.profilePictureUrl(userId, "image") || defaultProfilePic;
      profileUrl2 = await ctx._client.profilePictureUrl(targetUserId, "image") || defaultProfilePic;
    } catch (error) {
      console.error("Error fetching profile pictures:", error);
    }

    // Prepare the data for the ship image generation
    const shipRequestData = {
      person1Name: userId.split('@')[0], // Use the user's JID name (without domain)
      person2Name: targetUserId.split('@')[0], // Target user's JID name (without domain)
      person1Image: profileUrl1,
      person2Image: profileUrl2
    };

    try {
      // Make a POST request to your Express server to generate the ship image
      const response = await axios.post('https://shazam-r9b1.onrender.com/ship', shipRequestData, {
        responseType: 'arraybuffer', // Expect the image data as a buffer
      });

      // Send the generated ship image as a reply to the user
      const mimeType = mime.contentType("png") || "image/png";
      const imageBuffer = Buffer.from(response.data); // Convert the response to a Buffer

      await ctx.reply({
        image: imageBuffer, // Send the image as a buffer
        mimetype: mimeType,
        caption: `💖 *Ship between You and @${targetUserId.split('@')[0]}*`
      });

    } catch (error) {
      console.error("Error generating ship image:", error);
      return ctx.reply("An error occurred while generating the ship image.");
    }
  },
};
