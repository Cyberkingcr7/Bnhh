import { Ctx } from '@mengkodingan/ckptw';
import * as linkify from 'linkifyjs';  // Ensure to import linkifyjs
import { DatabaseHandler } from '../../db/DatabaseHandler';
import { isBotMuted } from '../../lib/main';

const dbHandler = new DatabaseHandler();

module.exports = {
  name: "join",
  category: "Group",
  code: async (ctx: Ctx): Promise<void> => {
      // Ensure the user is authenticated before proceeding
      const userId = ctx.sender?.jid!;
      const userDocSnapshot = await dbHandler.getUser(userId);
 // Check if the bot is muted
 if (isBotMuted()) {
    await ctx.reply("The bot is currently muted and cannot process this command.");
    return;
}
      if (!userDocSnapshot.exists) {
        return void ctx.reply("🟥 *User not found. Please write !register*");
      }

      const senderJid = ctx.sender?.jid!;
      const userRole = userDocSnapshot.data()?.role;
      if (userRole !== 'superuser' && userRole !== 'poweruser') {
          await ctx.reply("You do not have permission to use this command.");
          return;
      }
      // Parse the input and extract the invite link
      let body!: string;
      if (!ctx.args.length) {
          return void ctx.reply("Please provide the invite link.");
      } else {
          body = ctx.args.join(" ").trim();
      }

      // Extract URLs directly using linkify
      const URLS = extractUrls(body);  // Use the function defined below
      const urls = URLS.filter((url) => url.includes('chat.whatsapp.com'));

      if (!urls.length) {
          return void ctx.reply("No valid WhatsApp invite link found.");
      }

      const splittedUrl = urls[0].split('/');
      const code = splittedUrl[splittedUrl.length - 1];

      try {
          // Attempt to join the group using the invite code
          await ctx._client.groupAcceptInvite(code);
          await ctx.reply(`✅ Successfully joined the group.`);
      } catch (err) {
          console.log(err);
          await ctx.reply("🟨 *Can't join the group. Check if the invite link is valid. If it's valid, I may have been removed.*");
      }
  }
};

// Function to extract URLs from the given content
const extractUrls = (content: string): string[] => {
    const urls = linkify.find(content);
    const arr: string[] = [];
    for (const url of urls) {
        arr.push(url.value);
    }
    return arr;
};
