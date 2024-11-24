import { Ctx, quote } from "@mengkodingan/ckptw";
import Sticker, { StickerTypes } from "wa-sticker-formatter";
import { DatabaseHandler } from "../../db/DatabaseHandler";
import { isBotMuted } from "../../lib/main";

const dbHandler = new DatabaseHandler();

module.exports = {
    name: "steal",
    aliases: ["take"],
    category: "Utils",
    code: async (ctx:Ctx) => {
        const userId =  ctx.sender?.jid!
          const userDocSnapshot = await dbHandler.getUser(userId);
 // Check if the bot is muted
 if (isBotMuted()) {
    await ctx.reply("The bot is currently muted and cannot process this command.");
    return;
}
      if (!userDocSnapshot.exists) {
        return ctx.reply("🟥 *User not found. Please write !register*"); // Removed unnecessary await
      }

        const input = ctx.args.join(" ") || null;

        if (!input) return await ctx.reply("suijin|Bnh")
        try {
            const buffer:any = await ctx.msg.media.toBuffer() || await ctx.quoted?.media.toBuffer();
            const [packname, author] = input.split("|");
            const sticker = new Sticker(buffer, {
                pack: packname || "",
                author: author || "",
                type: StickerTypes.FULL,
                categories: ["✨"],
                id: ctx?.id!,
                quality: 80
            });

            return await ctx.reply(await sticker.toMessage());
        } catch (error:any) {
            console.error(`Error:`, error);
            return await ctx.reply(quote(`⚠️Error: ${error.message}`));
        }
    }}