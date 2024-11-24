import { Ctx } from '@mengkodingan/ckptw';
import { checkAdmin, ensureAuthenticated } from '../../lib/utils';
import { DatabaseHandler } from '../../db/DatabaseHandler';
import { isBotMuted } from '../../lib/main';

const dbHandler = new DatabaseHandler();

module.exports = {
  name: "Demote",
  category: "Group",
  code: async (ctx: Ctx): Promise<void> => {
 // Check if the bot is muted
 if (isBotMuted()) {
  await ctx.reply("The bot is currently muted and cannot process this command.");
  return;
}
    const userId = ctx.sender?.jid!
      const userDocSnapshot = await dbHandler.getUser(userId);

      if (!userDocSnapshot.exists) {
        return void ctx.reply("🟥 *User not found. Please write !register*"); // Removed unnecessary await
      }


    const senderJid = ctx.sender?.jid!;
    const isAdmin = await checkAdmin(ctx, senderJid);
    if (!isAdmin) {
        await ctx.reply("You do not have permission to use this command.");
        return;
    }

    // Get mentioned users or quoted tags
    const mentioned = ctx.getMentioned();
    const quotedContent = ctx.quoted?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;

    let targets: string[] = [];

    if (mentioned && mentioned.length > 0) {
      targets = mentioned;
    } else if (quotedContent && quotedContent.includes("@")) {
      targets = quotedContent.match(/@\w+/g)?.map(tag => tag.substring(1)) || [];
    } else {
      ctx.reply("No users specified to demote. Please mention or tag users.");
      return;
    }

    if (targets.length === 0) {
      ctx.reply("No valid users found to demote.");
      return;
    }

    try {
      await ctx.group().demote(targets);
      await ctx.reply(`Successfully demoted ${targets.length} user(s) from admin.`);
    } catch (error) {
      console.error('Error handling demote command:', error);
      await ctx.reply('An error occurred while trying to demote users.');
    }
  }}