import { Client, Ctx, SectionsBuilder } from "@mengkodingan/ckptw";
import ytdl from 'youtube-dl-exec';
import ytsr from 'ytsr';
import fs from 'fs/promises';
import path from 'path';
import { askQuestion } from '../../lib/utils'; // Adjust path
import { ensureAuthenticated } from "../../lib/utils";
import { dbHandler } from "../../db/DatabaseHandler";
import { isBotMuted } from "../../lib/main";

// Function to search YouTube
async function searchYouTube(query: string) {
    try {
        const searchResults = await ytsr(query, { limit: 20 }); // Fetch 20 results
        return searchResults.items?.filter(item => item.type === 'video').slice(0, 10); // Slice the first 10 results
    } catch (error) {
        console.error('Error during YouTube search:', error);
        return [];
    }
}

// Function to download video
async function downloadVideo(url: string, output: string) {
    try {
        console.log(`Starting video download from ${url}...`);
        await ytdl(url, {
            format: 'best',
            noPart:true,
            output,
            noWarnings: true
        });
        console.log(`Video download complete: ${output}`);
    } catch (error) {
        console.error('Error during video download:', error);
        throw new Error('Failed to download video.');
    }
}

// Function to download audio
async function downloadAudio(url: string, output: string) {
    try {
        console.log(`Starting audio download from ${url}...`);
        await ytdl(url, {
            extractAudio: true,
            audioFormat: 'mp3',
            output,
        });
        console.log(`Audio download complete: ${output}`);
    } catch (error) {
        console.error('Error during audio download:', error);
        throw new Error('Failed to download audio.');
    }
}

// Function to build the input selection section
const buildInputSection = () => {
    return new SectionsBuilder()
        .setDisplayText("Choose an option")
        .addSection({
            title: 'Options',
            rows: [
                { title: 'Search YouTube', id: 'search' },
                { title: 'Download from URL', id: 'url' }
            ]
        })
        .build();
};

// Function to build the media type selection section
const buildMediaTypeSelectionSection = () => {
    return new SectionsBuilder()
        .setDisplayText("Choose media type")
        .addSection({
            title: 'Media Type',
            rows: [
                { title: 'Download Video', id: 'video' },
                { title: 'Download Audio', id: 'audio' }
            ]
        })
        .build();
};

// Function to build the video selection section
const buildVideoSelectionSection = (results: any[]) => {
    return new SectionsBuilder()
        .setDisplayText("Select a video/audio")
        .addSection({
            title: 'Available Videos',
            rows: [
                ...results.map((video, index) => ({
                    header: `Video ${index + 1}`,
                    title: video.title,
                    description: `Duration: ${video.duration || 'N/A'}`,
                    id: index.toString()
                })),
                { title: 'Cancel', id: '-1' } // Add "Cancel" option
            ]
        })
        .build();
};

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

// Main command execution logic
module.exports = {
    name: "yt",
    aliases: ["youtube"],
    category: "Utils",
    code: async (ctx: Ctx, bot: Client) => {
        try {
              // Check if the bot is muted
            // Step 1: Ask user to choose an option
            await ctx.sendInteractiveMessage(ctx.id!, {
                body: 'Please choose an option:',
                nativeFlowMessage: { buttons: [buildInputSection()] }
            });
 // Check if the bot is muted
 if (isBotMuted()) {
    await ctx.reply("The bot is currently muted and cannot process this command.");
    return;
}
            // Step 2: Wait for user choice
            const inputResponse = await askQuestion(ctx, "Enter the number of your choice:");

            if (inputResponse === 'search') {
                // User chose to search YouTube
                const query = await askQuestion(ctx, "Enter your search query:");
                const results = await searchYouTube(query);
                if (results.length === 0) {
                    return ctx.reply("No results found. Please try again.");
                }

                // Send video selection options
                await ctx.sendInteractiveMessage(ctx.id!, {
                    body: 'Select what you want to download:',
                    nativeFlowMessage: { buttons: [buildVideoSelectionSection(results)] }
                });

                // Wait for user to select a video
                const videoSelectionResponse = await askQuestion(ctx, "Select what you want to download:");
                const selectedIndex = parseInt(videoSelectionResponse.trim(), 10);

                if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < results.length) {
                    const selectedVideo = results[selectedIndex].url;
                    console.log(`Selected video URL: ${selectedVideo}`);

                    // Ask user to choose media type (video or audio)
                    await ctx.sendInteractiveMessage(ctx.id!, {
                        body: 'Do you want to download the video or just the audio?',
                        nativeFlowMessage: { buttons: [buildMediaTypeSelectionSection()] }
                    });

                    const mediaTypeResponse = await askQuestion(ctx, "Enter 'video' or 'audio':");

                    // Ensure download directory exists and create output path
                    const downloadDir = await ensureDownloadDirectory();
                    const output = path.join(downloadDir, `${Date.now()}.${mediaTypeResponse === 'audio' ? 'mp3' : 'mp4'}`);

                    if (mediaTypeResponse === 'audio') {
                        await downloadAudio(selectedVideo, output);
                    } else {
                        await downloadVideo(selectedVideo, output);
                    }

                    // Delay to ensure the file is available
                    await delay(5000); // Wait for 5 seconds

                    if (mediaTypeResponse === 'audio') {
                        await ctx.reply({
                            audio: { url: output },
                            mimetype: 'audio/mp4',
                            ptt: false
                        });
                    } else {
                        await ctx.reply({
                            video: await fs.readFile(output),
                            caption: "Here is your selected YouTube video!",
                            gifPlayback: false
                        });
                    }

                    // Delay the deletion to allow time for processing
                    await delay(120000); // Wait for 2 minutes (120,000 milliseconds)
                    
                    // Clean up the downloaded file after delay
                    await fs.unlink(output);
                } else {
                    await ctx.reply("Invalid selection. Please try again.");
                }
            } else if (inputResponse === 'url') {
                // User chose to download from URL
                const url = await askQuestion(ctx, "Enter your YouTube URL:");

                const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/i;

                if (youtubeUrlPattern.test(url)) {
                    console.log(`Processing video URL: ${url}`);

                    // Ask user to choose media type (video or audio)
                    await ctx.sendInteractiveMessage(ctx.id!, {
                        body: 'Do you want to download the video or just the audio?',
                        nativeFlowMessage: { buttons: [buildMediaTypeSelectionSection()] }
                    });

                    const mediaTypeResponse = await askQuestion(ctx, "Enter 'video' or 'audio':");

                    // Ensure download directory exists and create output path
                    const downloadDir = await ensureDownloadDirectory();
                    const output = path.join(downloadDir, `${Date.now()}.${mediaTypeResponse === 'audio' ? 'mp3' : 'mp4'}`);

                    if (mediaTypeResponse === 'audio') {
                        await downloadAudio(url, output);
                    } else {
                        await downloadVideo(url, output);
                    }

                    // Delay to ensure the file is available
                    await delay(5000); // Wait for 5 seconds

 await ctx.reply('downloading')  
                  if (mediaTypeResponse === 'audio') {
                        await ctx.reply({
                            audio: { url: output },
                            mimetype: 'audio/mp4',
                            ptt: false
                        });
                    } else {
                        await ctx.reply({
                            video: await fs.readFile(output),
                            caption: "Here is your YouTube video!",
                            gifPlayback: false
                        });
                    }

                    // Delay the deletion to allow time for processing
                    await delay(120000); // Wait for 2 minutes (120,000 milliseconds)
                    
                    // Clean up the downloaded file after delay
                    await fs.unlink(output);
                } else {
                    await ctx.reply("Invalid URL. Please provide a valid YouTube URL.");
                }
            } else {
                await ctx.reply("Invalid choice. Please try again.");
            }
        } catch (error:any) {
            console.error('Error in main execution:', error);
            await ctx.reply(`An error occurred: ${error.message}`);
        }
    }
}