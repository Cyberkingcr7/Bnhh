import { Ctx } from '@mengkodingan/ckptw';
import { checkAdmin, ensureAuthenticated } from '../../lib/utils';
import { S_WHATSAPP_NET } from '@whiskeysockets/baileys';
import { DatabaseHandler } from '../../db/DatabaseHandler';
import { isBotMuted } from '../../lib/main';

const dbHandler = new DatabaseHandler();

module.exports = {
  name: "Add",
  category: "Group",
  code: async (ctx: Ctx): Promise<void> => {
      // Ensure the user is authenticated before proceeding
        const userId = ctx.sender?.jid!;
 // Check if the bot is muted
 if (isBotMuted()) {
  await ctx.reply("The bot is currently muted and cannot process this command.");
  return;
}
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

    // Parse the input
    const input = ctx.args.join(" ").trim();
    if (!input) {
      ctx.reply("Please specify the number to add.");
      return;
    }

    try {
      // Format and prepare the WhatsApp number
      const accountFormatted = input.replace(/[^\d]/g, "");
      const account = accountFormatted + S_WHATSAPP_NET; // Ensure S_WHATSAPP_NET is defined elsewhere

      // Check if the number exists on WhatsApp
      const [result] = await ctx._client.onWhatsApp(accountFormatted);
      if (!result.exists) {
        return void ctx.reply(`❎ User is not registered on WhatsApp.`);
      }

      // Add the user to the group
      await ctx.group().add([account]);

      // Send success message
      await ctx.reply(`✅ Successfully added the user!`);
    } catch (error:any) {
      console.error("Error:", error);
      await ctx.reply(`⚠ An error occurred: ${error.message}`);
    }}};
