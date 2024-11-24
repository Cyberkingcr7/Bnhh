import { Ctx } from '@mengkodingan/ckptw';
import { dbHandler } from '../../db/DatabaseHandler';
import { isBotMuted, setMuted } from '../../lib/main';

module.exports = {
  name: "unmute",
  category: "Dev",
  code: async (ctx: Ctx) => {
    const senderJid = ctx.sender?.jid;
    if (!senderJid) {
      await ctx.reply("Failed to retrieve your ID.");
      return;
    }

    try {
      // Check user's role
      const userDoc = await dbHandler.getUser(senderJid);
      if (!userDoc.exists) {
        await ctx.reply("You are not registered in the system.");
        return;
      }

      const userRole = userDoc?.data()?.role!;
      if (!['superuser', 'poweruser'].includes(userRole)) {
        await ctx.reply("You do not have permission to use this command.");
        return;
      }

      // Check current mute state
      if (!isBotMuted()) {
        await ctx.reply("The bot is already unmuted.");
        return;
      }

      // Set mute state to false (unmuted)
      setMuted(false);

      await ctx.reply("The bot has been unmuted and will respond to commands again.");
    } catch (error) {
      console.error('Error processing unmute command:', error);
      await ctx.reply("An error occurred while processing your request. Please try again later.");
    }
  },
};
