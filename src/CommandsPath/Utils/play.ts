import { Client, Ctx } from "@mengkodingan/ckptw";
import axios from 'axios';
import { DatabaseHandler, db } from "../../db/DatabaseHandler";
import * as admin from 'firebase-admin'
import { isBotMuted } from "../../lib/main";
const databaseHandler = new DatabaseHandler();
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
    name: "play",
    aliases: ["song"],
    category: "Utils",
    code: async (ctx: Ctx, bot: Client) => {
        // Get the song or artist name from the user input
        const songName = ctx.args.join(' ');
 // Check if the bot is muted
 if (isBotMuted()) {
    await ctx.reply("The bot is currently muted and cannot process this command.");
    return;
}
        try {
            // Step 1: Search for the song using the Miyan API
            const searchApiUrl = `https://miyanapi.vercel.app/youtube?query=${encodeURIComponent(songName)}`;
            const searchResponse = await axios.get(searchApiUrl);

            if (!searchResponse.data || !searchResponse.data.data || searchResponse.data.data.length === 0) {
                return ctx.reply("Sorry, I couldn't find the song.");
            }
           const userJid = ctx?.sender?.jid!
            await setXp(userJid, 10, 20); // Increment XP by a random amount between 10 and 20

            const firstResult = searchResponse.data.data[0];

            // Prepare data for the externalAdReply
            const externalAdReplyData = {
                description: `${firstResult.title} song and video out now: ${firstResult.url}\n\n${firstResult.description}`,
                length: firstResult.length || 0,
                thumbnail: firstResult.thumbnail || 'default_thumbnail_url', // Provide default if missing
                title: firstResult.title,
                url: firstResult.url,
                views: firstResult.views,
            };

            // Step 2: Fetch the audio file URL from the Miyan API
            const songUrl = `https://miyanapi.vercel.app/youtube?url=${encodeURIComponent(firstResult.url)}`;
            const songResponse = await axios.get(songUrl);

            if (!songResponse.data || !songResponse.data.data || !songResponse.data.data.audio_url) {
                return ctx.reply("Sorry, I couldn't fetch the audio file.");
            }
ctx.reply('Give me a second to cook something...')
            const audioUrl = songResponse.data.data.audio_url;

            // Step 3: Send the audio with externalAdReply metadata
            ctx.reply({
                audio: { url: audioUrl },
                mimetype: 'audio/mp4',
                contextInfo: {
                    externalAdReply: {
                        title: externalAdReplyData.title,
                        body: externalAdReplyData.description,
                        mediaType: 2,  // Media type for a YouTube video
                        thumbnailUrl: externalAdReplyData.thumbnail,
                        renderLargerThumbnail: true,
                        mediaUrl: externalAdReplyData.url,
                    },
                },
            });

        } catch (error) {
            console.error("Error fetching the song:", error);
            ctx.reply("An error occurred while fetching the song.");
        }
    }
};
