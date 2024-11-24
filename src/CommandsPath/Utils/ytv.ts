import { Client, Ctx } from "@mengkodingan/ckptw";
import fs from 'fs/promises';
import ytfps from 'ytfps';
import ytdl from 'youtube-dl-exec';
import path from 'path';
import { ButtonBuilder, CarouselBuilder } from "@mengkodingan/ckptw";
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { isBotMuted } from "../../lib/main";

// Set the path for FFmpeg binary
ffmpeg.setFfmpegPath(ffmpegPath!);

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
    name: 'ytv',
    category: 'Utils',
    description: 'Downloads videos from a YouTube playlist and sends them in a carousel',
    code: async (ctx: Ctx, bot: Client) => {
        const url = ctx.args[0];
        if (!url || typeof url !== 'string') {
            await ctx.reply("Please provide a valid YouTube playlist URL!");
            return;
        }
 // Check if the bot is muted
 if (isBotMuted()) {
    await ctx.reply("The bot is currently muted and cannot process this command.");
    return;
}
        await ctx.reply("Initiating download process for the playlist...");

        try {
            // Ensure the download directory exists
            const downloadDir = await ensureDownloadDirectory();
            const videoPaths: string[] = []; // Explicitly define as an array of strings

            // Fetch the playlist details
            const playlist = await ytfps(url);

            for (const video of playlist.videos) {
                const sanitizedTitle = video.title.replace(/[^a-z0-9]/gi, '_');
                const webmOutput = path.join(downloadDir, `${sanitizedTitle}.webm`); // Save as .webm initially
                const mp4Output = path.join(downloadDir, `${sanitizedTitle}.mp4`); // Final .mp4 output

                // Download the video as .webm
                await ytdl(video.url, {
                    output: webmOutput,
                    format: 'bestvideo+bestaudio'
                });

                // Convert the .webm file to .mp4 using fluent-ffmpeg
                await new Promise<void>((resolve, reject) => {
                    ffmpeg(webmOutput)
                        .output(mp4Output)
                        .on('end', async () => {
                            console.log(`Conversion finished: ${mp4Output}`);
                            videoPaths.push(mp4Output);
                            await fs.unlink(webmOutput); // Optionally delete the original .webm file
                            resolve(); // Resolve the promise without arguments
                        })
                        .on('error', (err) => {
                            console.error(`Error converting video: ${err.message}`);
                            reject(err); // Reject the promise with the error
                        })
                        .run();
                });
            }

            // Prepare the carousel
            const carouselBuilder = new CarouselBuilder();

            for (const videoPath of videoPaths) {
                const videoAttachment = await ctx.prepareWAMessageMedia(
                    { video: { url: videoPath } }, // Use video URL for the upload
                    { upload: ctx._client.waUploadToServer }
                );

                let button = new ButtonBuilder()
               // .setId('hello')
                .setDisplayText('Youtube video url:')
                .setType("cta_url")
                .setURL(url)
                    .build();

                carouselBuilder.addCard({
                    body: `${path.basename(videoPath)}`,
                    footer: "Bnh",
                    header: {
                        title: `Your requested video:`,
                        hasMediaAttachment: true,
                        ...videoAttachment // Attach the video media
                    },
                    nativeFlowMessage: { buttons: [button] } // Add button to the card
                });
            }

            // Send the interactive message with the carousel
            await ctx.replyInteractiveMessage({ 
                carouselMessage: {
                    cards: carouselBuilder.build(),
                },
            });

            // Optionally, delete the mp4 files after sending if not needed
         await Promise.all(videoPaths.map(path => fs.unlink(path)));

        } catch (error: any) {
            console.error('Error in ytv command execution:', error);
            await ctx.reply(`An error occurred during the process: ${error.message}`);
        }
    }
       }
