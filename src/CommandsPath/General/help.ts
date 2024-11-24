"use strict";
import { Ctx, SectionsBuilder } from "@mengkodingan/ckptw";
import { DatabaseHandler } from "../../db/DatabaseHandler";
import { isBotMuted } from "../../lib/main";

const dbHandler = new DatabaseHandler();

export interface Command {
    name: string;
    aliases?: string[];
    category?: string;
}

let botStartTime = Date.now();

module.exports = {
    name: "help",
    aliases: ["help list", "h"],
    category: "General",
    code: async (ctx: Ctx) => {
        if (!ctx.id) {
            return ctx.reply("Failed to retrieve user ID.");
        }
 // Check if the bot is muted
 if (isBotMuted()) {
    await ctx.reply("The bot is currently muted and cannot process this command.");
    return;
}
        const userId = ctx.sender?.jid!;
        const userDocSnapshot = await dbHandler.getUser(userId);

        if (!userDocSnapshot.exists) {
            return ctx.reply("🟥 *User not found. Please write !register*");
        }

         // Check the current mute state before unmuting
    const currentMuteState = await dbHandler.getMuteState();

    if (!currentMuteState) {
      await ctx.reply("The bot is already unmuted.");
      return;
    }

        if (!ctx._config.cmd) {
            console.log(ctx?._config?.cmd!)
            await ctx.reply("No commands available.");
            return;
        }

        const uptime = Date.now() - botStartTime;
        const uptimeSeconds = Math.floor(uptime / 1000);
        const uptimeMinutes = Math.floor(uptimeSeconds / 60);
        const uptimeHours = Math.floor(uptimeMinutes / 60);
        const uptimeFormatted = `${uptimeHours} hours, ${uptimeMinutes % 60} minutes, ${uptimeSeconds % 60} seconds`;

        const categories = ctx._config.cmd.reduce((acc, cmd) => {
            const category = cmd.category || 'General';
            if (!acc[category]) acc[category] = [];
            acc[category].push(cmd);
            return acc;
        }, {} as { [key: string]: Command[] });

        const section = new SectionsBuilder().setDisplayText("Command List");

        let bodyText = `*Konnichiwa! I'm the BNH bot!!*\n`;
        bodyText += `*The usable commands are listed below.*\n\n`;

        Object.keys(categories).forEach((category) => {
            bodyText += `*━━━❰ ${category} ❱━━━*\n\n`;
            const commandNames = categories[category].map((cmd) => cmd.name).join(" , ");
            bodyText += `${commandNames}\n\n`;
        });

        bodyText += ` ────────────────────\n`;
        bodyText += `│- ᴜꜱᴇʀ: *${ctx?._sender?.pushName}*\n`;
        bodyText += `│- ɴᴀᴍᴇ: BNH\n`;
        bodyText += `│- ᴘʀᴇꜰɪx: ${ctx?._config?.prefix}\n`;
        bodyText += `│- Uptime: ${uptimeFormatted}\n`;
        bodyText += `╰────────────────────\n`;

        Object.keys(categories).forEach((category) => {
            const categorySection = {
                title: category,
                rows: categories[category].map((cmd) => ({
                    header: cmd.name,
                    title: cmd.aliases?.join(", ") || "No aliases",
                    description: `Usage: !${cmd.name}`,
                    id: `!${cmd.name}`,
                })),
            };
            section.addSection(categorySection);
        });

        await ctx.sendInteractiveMessage(ctx.id!, {
            body: bodyText,
            footer: "Bnh",
            nativeFlowMessage: {
                buttons: [section.build()],
            },
        });
    },
};
