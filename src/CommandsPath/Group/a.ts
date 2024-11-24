import { Client, Ctx } from "@mengkodingan/ckptw";
import { DatabaseHandler } from '../../db/DatabaseHandler'; // Assuming this is the same as in the gamble command
import { checkAdmin, ensureAuthenticated } from "../../lib/utils";
import { isBotMuted } from "../../lib/main";

const dbHandler = new DatabaseHandler();

module.exports = {
  name: "antilink",
  aliases: ['a'],
  category: "Group",
  code: async (ctx: Ctx, bot: Client) => {
    try {
      // Ensure the user is authenticated before proceeding
        const userId = ctx.sender?.jid!;
 // Check if the bot is muted
 if (isBotMuted()) {
  await ctx.reply("The bot is currently muted and cannot process this command.");
  return;
}
const userDocSnapshot = await dbHandler.getUser(userId);

      if (!userDocSnapshot.exists) {
        return ctx.reply("🟥 *User not found. Please write !register*"); // Removed unnecessary await
      }

        if (!ctx.isGroup()) {
          await ctx.reply("This command can only be used in groups.");
          return;
        }

        const groupId = ctx._msg?.key?.remoteJid!;
        if (!groupId) {
          await ctx.reply("Failed to retrieve group ID.");
          return;
        }

        const senderJid = ctx.sender?.jid!;
        if (!senderJid) {
          await ctx.reply("Failed to retrieve your ID. Please write !register");
          return;
        }

        // Check if the sender is an admin
        const isAdmin = await checkAdmin(ctx, senderJid);
        if (!isAdmin) {
          await ctx.reply("You do not have permission to use this command.");
          return;
        }

        // Parse command arguments
        const args = ctx.args;
        if (args.length === 0) {
          await ctx.reply("Please specify `--on` to enable or `--off` to disable the anti-link feature.");
          return;
        }

        const option = args[0].toLowerCase();
        if (option === '--on') {
          await dbHandler.setAntilink(groupId, true);
          await ctx.reply("Anti-link feature has been enabled for this group.");
        } else if (option === '--off') {
          await dbHandler.setAntilink(groupId, false);
          await ctx.reply("Anti-link feature has been disabled for this group.");
        } else {
          await ctx.reply("Invalid option. Use `--on` to enable or `--off` to disable.");
        }
      
    } catch (error) {
      console.error('Error:', error);
      await ctx.reply("Sorry, there was an error processing your request.");
    }
  }}
