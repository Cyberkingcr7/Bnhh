import { Ctx } from '@mengkodingan/ckptw';
import { checkAdmin, ensureAuthenticated } from '../../lib/utils';
import { DatabaseHandler } from '../../db/DatabaseHandler';
import { isBotMuted } from '../../lib/main';

const dbHandler = new DatabaseHandler();

module.exports = {
  name: "Group",
  category: "Group",
  code: async (ctx: Ctx): Promise<void> => {
    const userId = ctx.sender?.jid!
      const userDocSnapshot = await dbHandler.getUser(userId);
 // Check if the bot is muted
 if (isBotMuted()) {
  await ctx.reply("The bot is currently muted and cannot process this command.");
  return;
}
      if (!userDocSnapshot.exists) {
        return void ctx.reply("🟥 *User not found. Please write !register*"); // Removed unnecessary await
      }

    console.log("Received message context:", ctx);

    // Check if the sender is an admin
    const senderJid = ctx.sender?.jid!;
    const isAdmin = await checkAdmin(ctx, senderJid);
    if (!isAdmin) {
      await ctx.reply("You do not have permission to use this command.");
      return;
    }

    // Parse the command and flags
    const args = ctx.msg?.content?.split(' ')!;
    const command = args[1]; // Assuming the first argument is the command (e.g., `--open` or `--close`)

    if (command === '--open') {
      try {
        // Open the group (e.g., enable messaging)
        await ctx.group().open();
        await ctx.reply("The group has been opened.");
      } catch (error) {
        console.error('Error handling open command:', error);
        await ctx.reply('An error occurred while trying to open the group.');
      }
    } else if (command === '--close') {
      try {
        // Close the group (e.g., disable messaging)
        await ctx.group().close();
        await ctx.reply("The group has been closed.");
      } catch (error) {
        console.error('Error handling close command:', error);
        await ctx.reply('An error occurred while trying to close the group.');
      }
    } else {
      await ctx.reply("Invalid command. Use `--open` to open the group or `--close` to close it.");
    }
  }}