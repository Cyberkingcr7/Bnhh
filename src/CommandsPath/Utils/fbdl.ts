import { Client, Ctx, ButtonBuilder, CarouselBuilder } from "@mengkodingan/ckptw";
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import admin from 'firebase-admin'; // Ensure Firebase is properly initialized
import { DatabaseHandler, db } from "../../db/DatabaseHandler";
import { isBotMuted } from "../../lib/main";

const dbHandler = new DatabaseHandler();
// Function to fetch Facebook video download information
async function fetchFacebookData(videoUrl: string): Promise<any> {
    const apiURL = `https://api.agatz.xyz/api/facebook?url=${videoUrl}`;
    try {
        const response = await fetch(apiURL);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        const data = await response.json();
        console.log(data);
        return data.data.hd || data.data.sd; // Fetch HD or fallback to SD
    } catch (error) {
        console.error('Error fetching Facebook video data:', error);
        throw new Error('Unable to download the Facebook video.');
    }
}

// Function to ensure the download directory exists
async function ensureDownloadDirectory() {
    const downloadDir = path.join(process.cwd(), 'downloads');
    try {
        await fs.mkdir(downloadDir, { recursive: true });
        console.log(`Download directory confirmed: ${downloadDir}`);
    } catch (error) {
        console.error('Error creating download directory:', error);
    }
    return downloadDir;
}

// Function to delay execution
function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to increment user XP
async function setXp(jid: string, min: number, max: number): Promise<void> {
    const Xp = Math.floor(Math.random() * max) + min;
    try {
        const userRef = db.collection('users').doc(jid);
        await userRef.update({ Xp: admin.firestore.FieldValue.increment(Xp) });
        console.log(`User XP incremented by ${Xp} for user: ${jid}`);
    } catch (error) {
        console.error('Error updating XP:', error);
        await db.collection('users').doc(jid).set({ jid, Xp });
        console.log(`User XP record created with ${Xp} XP for user: ${jid}`);
    }
}

// Facebook video downloader command
module.exports = {
    name: "fb",
    aliases: ["fbdl","facebook"],
    category: "Utils",
    code: async (ctx: Ctx, bot: Client) => {
        try {
            const userId = ctx.sender?.jid!
            const userDocSnapshot = await dbHandler.getUser(userId);
 // Check if the bot is muted
 if (isBotMuted()) {
    await ctx.reply("The bot is currently muted and cannot process this command.");
    return;
}
            if (!userDocSnapshot.exists) {
              return ctx.reply("🟥 *User not found. Please write !register*"); // Removed unnecessary await
            }
            const query = ctx.args.join(" ").trim();

            if (!query.includes("facebook.com")) {
                return ctx.reply("Please provide a valid Facebook video URL.");
            }

            const res = await ctx.reply(`Fetching Facebook video...`);

            // Fetch video data using the Agatz API
            const downloadUrl = await fetchFacebookData(query);

            if (!downloadUrl) {
                await ctx.editMessage(res!.key, "Could not retrieve the video. Please try again.");
                return;
            }

            await ctx.editMessage(res!.key, "Downloading the video...");

            // Ensure download directory exists
            const downloadDir = await ensureDownloadDirectory();
            const output = path.join(downloadDir, `${Date.now()}.mp4`);

            // Download the video
            const response = await fetch(downloadUrl);
            const buffer = await response.buffer();
            await fs.writeFile(output, buffer);

            // Prepare the downloaded video as a media attachment
            let exampleMediaAttachment = await ctx.prepareWAMessageMedia(
                { video: { url: output } },
                { upload: ctx._client.waUploadToServer }
            );

            // Build carousel with the video attachment
            let button = new ButtonBuilder()
                .setId('!ping')
                .setDisplayText('command Ping')
                .setType("cta_url")
                .setURL(output)
                .build();

            let cards = new CarouselBuilder()
                .addCard({
                    body: "Here is your Facebook video!",
                    footer: "Enjoy!",
                    header: {
                        title: "Downloaded Video",
                        hasMediaAttachment: true,
                        ...exampleMediaAttachment
                    },
                    nativeFlowMessage: { buttons: [button] }
                })
                .build();

            // Send the interactive message with carousel
            ctx.replyInteractiveMessage({
                body: "",
                footer: "",
                carouselMessage: { cards }
            });

            // Increment user XP
            const userJid = ctx.sender?.jid!;
            await setXp(userJid, 10, 20);

            // Delay before deleting the file
            await delay(120000); // 2 minutes

            // Clean up the downloaded file
            await fs.unlink(output);
        } catch (error: any) {
            console.error('Error in fbdl command execution:', error);
            await ctx.reply(`An error occurred: ${error.message}`);
        }
    
}}
