import { Ctx, quote } from "@mengkodingan/ckptw";
import { MessageType } from "@mengkodingan/ckptw/lib/Constant";
import { Sticker, StickerTypes } from "wa-sticker-formatter";
import { DatabaseHandler } from "../../db/DatabaseHandler";
import { ensureAuthenticated } from "../../lib/utils";
import path from "path";
import fs from "fs/promises";
import { isBotMuted } from "../../lib/main";

const dbHandler = new DatabaseHandler();

async function ensureDownloadDirectory() {
    const downloadDir = path.join(process.cwd(), "downloads");
    try {
        await fs.mkdir(downloadDir, { recursive: true });
        console.log(`Download directory confirmed: ${downloadDir}`);
    } catch (error) {
        console.error("Error creating download directory:", error);
    }
    return downloadDir;
}

module.exports = {
    name: "sticker",
    aliases: ["s"],
    category: "Utils",
    code: async (ctx: Ctx) => {
        await ensureAuthenticated(ctx, async () => {
            const msgType = ctx.getMessageType();
 // Check if the bot is muted
 if (isBotMuted()) {
    await ctx.reply("The bot is currently muted and cannot process this command.");
    return;
}
            if (msgType !== MessageType.imageMessage && msgType !== MessageType.videoMessage && !(await ctx.quoted.media.toBuffer()))
                return ctx.reply(`must be a gif, picture, or video`);

            try {
                const buffer: any = await ctx.msg.media.toBuffer() || await ctx.quoted?.media.toBuffer();
                
                // Ensure the download directory exists
                const downloadDir = await ensureDownloadDirectory();
                
                // Save as PNG, assuming the media is an image
                const filename = path.join(downloadDir, `${ctx.id}.png`);
                
                // Save the buffer as a PNG file
                await fs.writeFile(filename, buffer);
                
                console.log(`File saved as: ${filename}`);

                // Create sticker and send as response
                const sticker = new Sticker(buffer, {
                    pack: 'suijin',
                    author: 'bnh',
                    type: StickerTypes.FULL,
                    categories: ['☺'],
                    id: ctx?.id!,
                    quality: 50,
                });

                return ctx.reply(await sticker.toMessage());
            } catch (error: any) {
                console.error(`Error:`, error);
                return ctx.reply(quote(`❎  ${error.message}`));
            }
        });
    },
};
