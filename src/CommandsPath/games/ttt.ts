import { Ctx } from "@mengkodingan/ckptw";
import axios from "axios";
import Jimp from "jimp";
import { DatabaseHandler } from "../../db/DatabaseHandler";
import { isBotMuted } from "../../lib/main";

// Initialize the database handler
const dbHandler = new DatabaseHandler();

// Game state management
const gameState = {
    board: Array(3).fill(null).map(() => Array(3).fill(null)) as (string | null)[][], // Define the type explicitly
    players: [] as string[],
    currentPlayer: 0,
    gameActive: false,
    markers: ['X', 'O'],
    starterId: '',
};


// Initialize the game board
const initializeBoard = (): any[][] => {
    return Array(3).fill(null).map(() => Array(3).fill(null)); // Return a new 3x3 array
};

// Check for a winner
const checkWinner = (chatId: string) => {
    const board = gameState.board;

    for (let i = 0; i < 3; i++) {
        if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
            return `row ${i}`;
        }
        if (board[0][i] && board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
            return `col ${i}`;
        }
    }

    if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
        return 'diag1';
    }
    if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
        return 'diag2';
    }

    return null;
};

// Create the board image
const createBoardImage = async (gameState: any, winner: string | null) => {
    const size = 300;
    const img = new Jimp(size, size, 0xffffffff); // White background
    const fontNumbers = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
    const fontMarkers = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    // Draw the grid
    for (let i = 1; i < 3; i++) {
        img.scan(0, i * 100, size, 1, (ix, iy) => {
            img.setPixelColor(0xff000000, ix, iy); // Draw horizontal line
        });
        img.scan(i * 100, 0, 1, size, (ix, iy) => {
            img.setPixelColor(0xff000000, ix, iy); // Draw vertical line
        });
    }

    // Draw numbers and X and O
    const numberMap = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ];

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const cell = gameState.board[row][col];
            const number = numberMap[row][col];
            img.print(fontNumbers, col * 100 + 40, row * 100 + 20, number.toString());
            if (cell) {
                img.print(fontMarkers, col * 100 + 30, row * 100 + 60, cell);
            }
        }
    }

    // Draw the winning line if there is a winner
    if (winner) {
        const color = 0xffff0000;
        if (winner.includes('row')) {
            const row = parseInt(winner.split(' ')[1]);
            img.scan(0, row * 100 + 50, size, 1, (ix, iy) => {
                img.setPixelColor(color, ix, iy);
            });
        } else if (winner.includes('col')) {
            const col = parseInt(winner.split(' ')[1]);
            img.scan(col * 100 + 50, 0, 1, size, (ix, iy) => {
                img.setPixelColor(color, ix, iy);
            });
        } else if (winner === 'diag1') {
            img.scan(0, 0, size, size, (ix, iy) => {
                if (ix === iy) img.setPixelColor(color, ix, iy);
            });
        } else if (winner === 'diag2') {
            img.scan(0, 0, size, size, (ix, iy) => {
                if (ix + iy === 2) img.setPixelColor(color, ix, iy);
            });
        }
    }

    const buffer = await img.getBufferAsync(Jimp.MIME_PNG);
    return buffer;
};

// Send the game board
const sendBoard = async (ctx: Ctx, boardImage: Buffer, message: string) => {
    await ctx.reply({
        image: boardImage, // Directly pass the buffer here
        caption: message,
    });
};

// Main Tic-Tac-Toe command handler
module.exports = {
    name: "ttt",
    category: "Games",
    code: async (ctx: Ctx) => {
        const chatId = ctx._msg.key.remoteJid!;
        const userId = ctx.sender?.jid!;
        const command = ctx.args[0];
 // Check if the bot is muted
 if (isBotMuted()) {
    await ctx.reply("The bot is currently muted and cannot process this command.");
    return;
}
        const userDocSnapshot = await dbHandler.getUser(userId);
        if (!userDocSnapshot.exists) {
            return ctx.reply("🟥 *User not found. Please write !register*");
        }

        try {
            if (command === "start") {
                if (gameState.gameActive) {
                    return ctx.reply("A game is already active in this chat.");
                }
                gameState.board = initializeBoard();
                gameState.players = [userId];
                gameState.currentPlayer = 0;
                gameState.gameActive = true;
                gameState.starterId = userId;

                ctx.reply("Game started! Another player can join with !ttt join.");
            } else if (command === "join") {
                if (!gameState.gameActive) return ctx.reply("No active game in this chat. Start a new game with !ttt start.");
                if (gameState.players.length >= 2) return ctx.reply("The game already has two players.");
                
                gameState.players.push(userId);
                await ctx.reply("Joined the game! Type !ttt move <number> to play.");
            } else if (command === "move") {
                if (!gameState.gameActive) return ctx.reply("No active game. Start one with !ttt start.");
                if (gameState.players[gameState.currentPlayer] !== userId) return ctx.reply("Not your turn!");

                const cellNumber = parseInt(ctx.args[1]);
                if (isNaN(cellNumber) || cellNumber < 1 || cellNumber > 9) return ctx.reply("Invalid move. Choose a number between 1 and 9.");

                const row = Math.floor((cellNumber - 1) / 3);
                const col = (cellNumber - 1) % 3;
                if (gameState.board[row][col]) return ctx.reply("Slot already taken. Choose another slot.");

                gameState.board[row][col] = gameState.markers[gameState.currentPlayer];
                
                const winner = checkWinner(chatId);
                const boardImage = await createBoardImage(gameState, winner);

                if (winner) {
                    gameState.gameActive = false;
                    await sendBoard(ctx, boardImage, `Player ${gameState.players[gameState.currentPlayer]} wins!`);
                } else if (gameState.board.flat().every((cell: any) => cell)) {
                    gameState.gameActive = false;
                    await sendBoard(ctx, boardImage, "It's a draw!");
                } else {
                    gameState.currentPlayer = 1 - gameState.currentPlayer;
                    await sendBoard(ctx, boardImage, `Move made! Next turn: Player ${gameState.players[gameState.currentPlayer]}`);
                }
            } else {
                ctx.reply("Invalid command. Use !ttt start, !ttt join, or !ttt move <number>.");
            }
        } catch (error) {
            console.error("Error handling Tic-Tac-Toe command:", error);
            ctx.reply("❌ An error occurred.");
        }
    }
};
