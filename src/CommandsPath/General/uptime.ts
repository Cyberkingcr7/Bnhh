import { Ctx } from "@mengkodingan/ckptw";
import { DatabaseHandler, db } from '../../db/DatabaseHandler';
import { isBotMuted } from "../../lib/main";

const dbHandler = new DatabaseHandler();

// To track uptime and commands
let botStartTime = Date.now();

module.exports = {
  name: "uptime",
  category: "General",
  code: async (ctx: Ctx) => {
    const userId = ctx._sender?.jid;
    const groupId = ctx.msg?.key?.remoteJid;
 // Check if the bot is muted
 if (isBotMuted()) {
  await ctx.reply("The bot is currently muted and cannot process this command.");
  return;
}
    if (!userId) {
      return ctx.reply("🟥 *User not found. Please write !register*");
    }

    try {
      // Calculate uptime
      const uptime = Date.now() - botStartTime;
      const uptimeSeconds = Math.floor(uptime / 1000);
      const uptimeMinutes = Math.floor(uptimeSeconds / 60);
      const uptimeHours = Math.floor(uptimeMinutes / 60);
      const uptimeFormatted = `${uptimeHours} hours, ${uptimeMinutes % 60} minutes, ${uptimeSeconds % 60} seconds`;

      // Get user count from Firestore database
      const userCountSnapshot = await db.collection('users').get();
      const userCount = userCountSnapshot.size;

      // Measure bot speed (ping test)
      const startTime = Date.now();
      const botSpeed = Date.now() - startTime;

      // Get the total number of registered commands from ctx._config.cmd size
      const totalCommands = ctx._config?.cmd?.size!; // .size will return the count of commands in the Collection

      // Respond with bot status information
      ctx.reply(`*━━━❰ Bot Uptime Status ❱━━━* 
        Uptime: ${uptimeFormatted} 
        Users: ${userCount} 
        Ping: ${botSpeed}ms 
        Registered Commands: ${totalCommands}`);
    } catch (error) {
      console.error('Error fetching uptime:', error);
      ctx.reply('An error occurred while fetching uptime data.');
    }
  },
};
