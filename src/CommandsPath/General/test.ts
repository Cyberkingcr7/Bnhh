import { Client, Ctx } from "@mengkodingan/ckptw";
import { DatabaseHandler } from '../../db/DatabaseHandler'; // Adjust the import path as necessary
import { isBotMuted } from "../../lib/main";

const dbHandler = new DatabaseHandler();

module.exports = {
    name: "test",
    category: "General",
    code: async (ctx: Ctx,) => {
        try {
            // Check if the bot is muted
            if (isBotMuted()) {
                await ctx.reply("The bot is currently muted and cannot process this command.");
                return;
            }

            // Ensure the command is only used in groups
            if (!ctx.isGroup()) {
                await ctx.reply("This command can only be used in groups.");
                return;
            }

            const senderJid = ctx.sender?.jid;
            if (!senderJid) {
                await ctx.reply("Failed to retrieve your ID.");
                return;
            }

            // Retrieve the user's role from the database
            const userDoc = await dbHandler.getUser(senderJid);
            if (!userDoc.exists) {
                await ctx.reply("You are not registered in the system.");
                return;
            }

            const userRole = userDoc.data()?.role;

            switch (userRole) {
                case 'superuser':
                    await ctx.reply("You are the root user.");
                    break;
                case 'poweruser':
                    await ctx.reply("You are a Lynx.");
                    break;
                default:
                    await ctx.reply("You are a normal user.");
                    break;
            }
        } catch (error) {
            console.error('Error:', error);
            await ctx.reply("Sorry, there was an error processing your request.");
        }
    }
};
