import { ButtonBuilder, CarouselBuilder, Client, Ctx } from "@mengkodingan/ckptw";
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import admin from 'firebase-admin'; // Ensure Firebase is properly initialized
import { db } from "../../db/DatabaseHandler";
import { isBotMuted } from "../../lib/main";

// Function to fetch TikTok video download information
async function fetchVideoData(videoUrl: string): Promise<any> {
    const apiURL = `https://api.tiklydown.eu.org/api/download?url=${videoUrl}`;  // Direct URL embedding
    try {
        const response = await fetch(apiURL);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        const data = await response.json();
        console.log(data)
        return data;
    } catch (error) {
        console.error('Error fetching video data:', error);
        throw new Error('Unable to download the TikTok video.');
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

module.exports = {
    name: "tkdl",
    aliases: ["tiktok"],
    category: "Utils",
    code: async (ctx: Ctx, ) => {
        try {
            const query = ctx.args.join(" ").trim();
 // Check if the bot is muted
 if (isBotMuted()) {
    await ctx.reply("The bot is currently muted and cannot process this command.");
    return;
}
            if (!query.includes("tiktok.com")) {
                return ctx.reply("Please provide a valid TikTok video URL.");
            }

            const res = await ctx.reply(`Fetching TikTok video...`);

            // Fetch video data using the Tiklydown API
            const videoData = await fetchVideoData(query);
            const downloadUrl = videoData.video.noWatermark; // Get the no watermark URL

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

            // Send the video as a direct reply without using cards
            await ctx.reply({
                video: await fs.readFile(output),
                caption: "",
                gifPlayback: false
            });

            // Increment user XP
            const userJid = ctx.sender?.jid!;
            await setXp(userJid, 10, 20);

            // Delay before deleting the file
            await delay(120000); // 2 minutes

            // Clean up the downloaded file
            await fs.unlink(output);
        } catch (error: any) {
            console.error('Error in tkdl command execution:', error);
            await ctx.reply(`An error occurred: ${error.message}`);
        }
    }}
