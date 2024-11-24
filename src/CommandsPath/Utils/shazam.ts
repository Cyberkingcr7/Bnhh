import { Ctx, quote } from "@mengkodingan/ckptw";
import axios from 'axios';
import FormData from 'form-data';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises'; // Use fs/promises for async file operations
import path from 'path';
import { isBotMuted } from "../../lib/main";

const execAsync = promisify(exec);

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

module.exports = {
    name: "shazam",
    aliases: ["sz"],
    category: "Utils",
    code: async (ctx: Ctx) => {
        const extendedTextMessage = ctx?._msg?.message?.extendedTextMessage!;
        const quotedMessage = extendedTextMessage?.contextInfo?.quotedMessage!;
        const message = ctx.msg;
 // Check if the bot is muted
 if (isBotMuted()) {
    await ctx.reply("The bot is currently muted and cannot process this command.");
    return;
}
        if (message.messageType === "extendedTextMessage") {
            const extendedTextMessage = message?.message?.extendedTextMessage!;
            const quotedMessage = extendedTextMessage.contextInfo?.quotedMessage;

            if (quotedMessage) {
                try {
                    let buffer: Buffer | null = null;

                    // Ensure the downloads directory exists
                    const downloadDir = await ensureDownloadDirectory();

                    if (quotedMessage.audioMessage) {
                        // Extract audio buffer from quoted audio message
                        buffer = await ctx.quoted?.media.toBuffer();
                    } else if (quotedMessage.videoMessage) {
                        // Extract video buffer from quoted video message
                        const videoBuffer = await ctx.quoted?.media.toBuffer();

                        if (!videoBuffer) {
                            return ctx.reply("No video buffer found.");
                        }

                        // Save video to a temporary file
                        const videoPath = path.join(downloadDir, "temp_video.mp4");
                        const audioPath = path.join(downloadDir, "temp_audio.mp3");
                        await fs.writeFile(videoPath, videoBuffer);

                        // Extract audio from video using FFmpeg
                        await execAsync(`ffmpeg -i ${videoPath} -q:a 0 -map a ${audioPath}`);
                        buffer = await fs.readFile(audioPath);

                        // Clean up temporary files
                        await fs.unlink(videoPath);
                        await fs.unlink(audioPath);
                    }

                    if (!buffer) {
                        return ctx.reply("No valid audio found.");
                    }

                    // Create FormData and send the audio to Shazam API
                    const formData = new FormData();
                    formData.append("audio", buffer, { filename: "audio.mp3" });

                    const response = await axios.post("https://shazam-r9b1.onrender.com/recognize", formData, {
                        headers: {
                            ...formData.getHeaders(),
                        },
                    });

                    const songInfo = response.data;
                    if (songInfo) {
                        const songMessage = `
              *━━━❰  𝗦𝗵𝗮𝘇𝗮𝗺  ❱━━━*

🎵 *Title:* ${songInfo.title || "Not available"}

🎤 *Artist:* ${songInfo.artist || "Not available"} 

💿 *Album:* ${songInfo.album || "Not available"} 

📅 *Release Year:* ${songInfo.releaseYear || "Not available"}  
🎶 *Genre:* ${songInfo.genre || "Not available"} 

🚨 *Explicit:* ${songInfo.explicit ? "Yes" : "No"}  

🔍 *Shazam:* ${songInfo.shazamLink || "Not available"}  
`;

                        await ctx.reply({
                            image: { url: songInfo.coverArt || "https://default-image-url.com/default-cover.jpg" },
                            caption: songMessage,
                        });

                        console.log(songMessage);
                    } else {
                        await ctx.reply("No song found.");
                    }
                } catch (error: any) {
                    console.error("Error:", error);
                    return ctx.reply(quote(`❎ ${error.message}`));
                }
            }
        }
    },
};
