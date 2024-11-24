import { DatabaseHandler } from "../../db/DatabaseHandler"; // Adjust the path if needed
import { Ctx } from "@mengkodingan/ckptw";
import mime from 'mime-types'; // Make sure to install the 'mime-types' package
import { isBotMuted } from "../../lib/main";

const dbHandler = new DatabaseHandler();

module.exports = {
  name: "profile",
  category: "General",
  code: async (ctx: Ctx) => {

    const userId = ctx._sender?.jid;
 // Check if the bot is muted
 if (isBotMuted()) {
  await ctx.reply("The bot is currently muted and cannot process this command.");
  return;
}
    if (!userId) {
      console.error("User ID is undefined");
      return ctx.reply("🟥 *User not found.*");
    }

    let target
    target = null ;

    // Check if there is a quoted message
    if (ctx.quoted) {
      const quotedParticipant = ctx._msg.message?.extendedTextMessage?.contextInfo?.participant;
      if (quotedParticipant) {
        target = quotedParticipant; // The JID of the quoted message's sender
      }
    }

    // Fallback to mentioned JIDs if no quoted message
    if (!target) {
      const mentionedJids = ctx.getMentioned();
      if (mentionedJids && mentionedJids.length > 0) {
        target = mentionedJids[0];
      }
    }

    // Default to the user's own profile if no target is found
    if (!target) {
      target = userId;
    }

    let profileUrl: string;

try {
  // Log request details
  console.log("Requesting profile picture URL from API...");
  
  // TypeScript expects profileUrl to always be a string
  // Use a fallback URL if profilePictureUrl returns undefined
  profileUrl = await ctx._client.profilePictureUrl(target, "image") || "https://i.ibb.co/3Fh9V6p/avatar-contact.png";

  console.log("Fetched profile picture URL:", profileUrl);
} catch (error) {
  // Handle error as an instance of Error
  if (error instanceof Error) {
    console.error("Error fetching profile picture URL:", error.message);
    console.error("Error stack:", error.stack);

    // Provide hints for common issues
    if (error.message.includes("bad-request")) {
      console.error("Bad request error: The request might be malformed or invalid.");
    } else if (error.message.includes("network")) {
      console.error("Network error: Check your network connection.");
    } else {
      console.error("An unexpected error occurred.");
    }

    // Fallback URL usage
    profileUrl = "https://i.ibb.co/3Fh9V6p/avatar-contact.png";
    console.log("Using fallback profile picture URL:", profileUrl);
  } else {
    // Handle non-Error cases
    console.error("An unexpected error occurred:", error);
    profileUrl = "https://i.ibb.co/3Fh9V6p/avatar-contact.png";
    console.log("Using fallback profile picture URL:", profileUrl);
  }
}

    try {
      // Fetch user profile data
      const userProfile = await dbHandler.getUser(target!);

      const userData = userProfile.data();
      const wallet = userData?.wallet || 0;
      const bank = userData?.bank || 0;
      const experience = userData?.Xp || 0;

      // Ensure valid MIME type
      const mimeType = mime.contentType("png") || "image/png"; // Fallback to default MIME type
      console.log("Sending reply with profile picture URL:", profileUrl);

      // Format profile response
      const profileMessage = `👤 *User Profile*\n\n` +
        `💰 *Wallet:* ${wallet} gold\n` +
        `🏦 *Bank:* ${bank} gold\n` +
        `⭐ *Experience:* ${experience} XP`;

      // Send profile picture and details
      if (target === userId) {
        await ctx.reply({
          image: {
            url: profileUrl,
          },
          mimetype: mimeType,
          caption: ` ${profileMessage}`
        });
      } else {
        const targetName = target.split("@")[0];
        await ctx.reply({
          image: {
            url: profileUrl,
          },
          mimetype: mimeType,
          caption: `👤 *Profile of @${targetName}*\n\n${profileMessage}`
        });
      }

    } catch (error) {
      console.error('Error retrieving user profile:', error);
      return ctx.reply('An error occurred while retrieving the profile.');
    }
  },
};
