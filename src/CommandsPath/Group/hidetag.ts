import { Ctx } from "@mengkodingan/ckptw";
import { S_WHATSAPP_NET } from "@whiskeysockets/baileys";
import { checkAdmin } from "../../lib/utils";
import { isBotMuted } from "../../lib/main";


module.exports = {
    name: "hidetag",
    aliases: ["ht","tagall"],
    category: "Group",
    code: async (ctx:Ctx) => {
 // Check if the bot is muted
 if (isBotMuted()) {
    await ctx.reply("The bot is currently muted and cannot process this command.");
    return;
}
        const input = ctx.args.join(" ") || "@everyone";
        const senderJid = ctx?.sender?.jid!;
        const isAdmin = await checkAdmin(ctx, senderJid);
        if (!isAdmin) {
            await ctx.reply("You do not have permission to use this command.");
            return;
        }
     try {
            const members = await ctx.group().members();
            const mentions = members.map(member => member.id.split(/[:@]/)[0] + S_WHATSAPP_NET);

            return await ctx.reply({
                text: input,
                mentions
            });
        } catch (error:any) {
            console.error(` Error:`, error);
            return await ctx.reply(`❎ Terjadi kesalahan: ${error.message}`);
        }
    }
};