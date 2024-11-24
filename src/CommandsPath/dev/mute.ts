import { Ctx } from '@mengkodingan/ckptw';
import { setMuted } from '../../lib/main';
import { dbHandler } from '../../db/DatabaseHandler';

module.exports = {
  name: "mute",
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

      // Set mute state to true (muted)
      setMuted(true);

      await ctx.reply("The bot has been muted. It will no longer respond to commands.");
    } catch (error) {
      console.error('Error processing mute command:', error);
      await ctx.reply("An error occurred while processing your request. Please try again later.");
    }
  },
};
