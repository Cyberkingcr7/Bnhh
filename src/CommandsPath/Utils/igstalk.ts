import { Client, Ctx } from "@mengkodingan/ckptw";
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import admin from 'firebase-admin'; // Ensure Firebase is properly initialized
import { db } from "../../db/DatabaseHandler";
import { DatabaseHandler } from "../../db/DatabaseHandler";
import { isBotMuted } from "../../lib/main";

const dbHandler = new DatabaseHandler();

// Function to fetch Instagram profile information using the new API
async function fetchInstagramProfileData(username: string): Promise<any> {
    const apiURL = `https://api.agatz.xyz/api/igstalk?name=${username}`;
    try {
        const response = await fetch(apiURL);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error fetching Instagram profile data:', error);
        throw new Error('Unable to retrieve Instagram profile information.');
    }
}

// Ensure the download directory exists
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

// Delay execution
function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Increment user XP
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

// Command to handle Instagram profile retrieval
module.exports = {
    name: "igprofile",
    aliases: ["instagram"],
    category: "Utils",
    code: async (ctx: Ctx, bot: Client) => {
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

        try {
            const username = ctx.args.join(" ").trim();

            if (!username) {
                return ctx.reply("Please provide a valid Instagram username.");
            }

            const res = await ctx.reply(`Fetching Instagram profile data for @${username}...`);

            // Fetch Instagram profile data
            const profileData = await fetchInstagramProfileData(username);
            const { profile_picture, biography, followers } = profileData.result;

            if (!profile_picture) {
                await ctx.editMessage(res!.key, "Could not retrieve the profile picture. Please try again.");
                return;
            }

            await ctx.editMessage(res!.key, "Sending profile information...");

            // Ensure download directory exists
            const downloadDir = await ensureDownloadDirectory();
            const output = path.join(downloadDir, `${username}_profile.jpg`);

            // Download the profile picture
            const response = await fetch(profile_picture);
            const buffer = await response.buffer();
            await fs.writeFile(output, buffer);

            // Send the profile data to the user
            await ctx.reply({
                image: { url: output },
                caption: `@${username}\n\nBio: ${biography}\nFollowers: ${followers}`
            });

            // Increment user XP
            const userJid = ctx.sender?.jid!;
            await setXp(userJid, 5, 15);

            // Delay before deleting the file
            await delay(120000); // 2 minutes

            // Clean up the downloaded file
            await fs.unlink(output);
        } catch (error: any) {
            console.error('Error in igprofile command execution:', error);
            await ctx.reply(`An error occurred: ${error.message}`);
        }
    }}