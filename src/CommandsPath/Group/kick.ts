import { Ctx, quote } from '@mengkodingan/ckptw';
import { checkAdmin, ensureAuthenticated } from '../../lib/utils';
import { DatabaseHandler } from '../../db/DatabaseHandler';
import { isBotMuted } from '../../lib/main';

const dbHandler = new DatabaseHandler();

module.exports = {
  name: "Kick",
  aliases: [ "remove"],
  category: "Group",
  code: async (ctx: Ctx): Promise<void> => {
    const userId =  ctx.sender?.jid!
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
            // Check if the sender is an 
            const senderJid = ctx?.sender?.jid!;
            const isAdmin = await checkAdmin(ctx, senderJid);
            if (!isAdmin) {
                await ctx.reply("You do not have permission to use this command.");
                return;
            }
            const senderNumber = senderJid.split(/[:@]/)[0];
            const mentionedJids = ctx.msg?.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const account = Array.isArray(mentionedJids) && mentionedJids.length > 0 ? mentionedJids[0] : null;
    
            if (!account) return void ctx.reply({
                text: (ctx._used.prefix + ctx._used.command, `@${senderNumber}`),
                mentions: [senderJid]
            });
    
            try {
            
                await ctx.group().kick([account]);
    
                return void ctx.reply(quote(`✅ Succesfull!`));
            } catch (error:any) {
                console.error(` Error:`, error);
                return void ctx.reply(quote(`❎  ${error.message}`));
            }
        }}