import { DatabaseHandler } from "../../db/DatabaseHandler";
import { Ctx } from "@mengkodingan/ckptw";
import mime from 'mime-types';
import { getStats } from "../../lib/stats";
import canvacord from "canvacord";
import { isBotMuted } from "../../lib/main";

const dbHandler = new DatabaseHandler();

module.exports = {
  name: "rank",
  category: "General",
  code: async (ctx: Ctx) => {
    const userId = ctx._sender?.jid;
    if (!userId) {
      console.error("User ID is undefined");
      return ctx.reply("🟥 *User not found.*");
    }
 // Check if the bot is muted
 if (isBotMuted()) {
  await ctx.reply("The bot is currently muted and cannot process this command.");
  return;
}
    let target = null;

    // Determine target user: quoted message, mentioned JIDs, or default to self
    if (ctx.quoted) {
      const quotedParticipant = ctx._msg.message?.extendedTextMessage?.contextInfo?.participant;
      if (quotedParticipant) target = quotedParticipant;
    }
    if (!target) {
      const mentionedJids = ctx.getMentioned();
      if (mentionedJids && mentionedJids.length > 0) target = mentionedJids[0];
    }
    if (!target) target = userId;

    // Get profile picture URL, with fallback
    let profileUrl: string;
    try {
      profileUrl = await ctx._client.profilePictureUrl(target, "image") || "https://i.ibb.co/3Fh9V6p/avatar-contact.png";
    } catch {
      profileUrl = "https://i.ibb.co/3Fh9V6p/avatar-contact.png";
    }

    try {
      // Fetch user data and rank stats
      const userProfile = await dbHandler.getUser(target!);
      const userData = userProfile.data();
      const experience = userData?.Xp || 0;
      const level = userData?.level || 1;
      const { requiredXpToLevelUp, rank } = getStats(level); // 'rank' should be the string like '🌸 Citizen'
      
      // Get username for the target user. Use the `target` JID or `ctx.sender?.pushName` for the current user
      const username = target === userId ? ctx.sender?.pushName || "Unknown" : target.split("@")[0];

      // Numeric rank (for canvacord) could be set to `level` or any other number.
      const numericRank = level; // Use level as a numeric rank

      // Generate the rank card using canvacord's Rank class
      const rankCard = new canvacord.Rank()
        .setAvatar(profileUrl) // The avatar URL or buffer
        .setCurrentXP(experience) // Current experience points
        .setRequiredXP(requiredXpToLevelUp) // XP required to level up
        .setStatus("online") // Status (optional)
        .setProgressBar("#FFFFFF", "COLOR") // Progress bar color
        .setUsername(username) // Username for display
        .setLevel(level) // User's level
        .setDiscriminator('0000', "#FF0000") // Set discriminator to '0000' with red color
        .setRank(numericRank); // Pass the numeric rank (level or position)

      const buffer = await rankCard.build(); // Build the rank card

      // Send rank card with custom caption, including string rank
      await ctx.reply({
        image: buffer,
        mimetype: mime.contentType("png") || "image/png",
        caption: `🏮 *Username:* ${username}\n\n🌟 *Experience:* ${experience} / ${requiredXpToLevelUp}\n\n🥇 *Rank:* ${rank}\n\n🍀 *Level:* ${level}`
      });

    } catch (error) {
      console.error('Error retrieving or sending rank card:', error);
      return ctx.reply('An error occurred while retrieving the rank.');
    }
  },
};
