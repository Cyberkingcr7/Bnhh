import puppeteer from 'puppeteer';
import { Client, Ctx } from "@mengkodingan/ckptw";
import { Buffer } from 'buffer';
import { generatePatternData,  OHLCData, patterns } from '../../lib/m';
import { DatabaseHandler } from '../../db/DatabaseHandler'; // Assuming this is the same as in the gamble command
import {  askQuestion, generateSessionId } from '../../lib/utils';
import { isBotMuted } from '../../lib/main';

interface AnalysisResult {
    movement: 'bullish' | 'bearish' | 'neutral';
    explanation: string;
}

const dbHandler = new DatabaseHandler();

async function generateCandlestickChart(data: OHLCData[]): Promise<Buffer> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const uniqueData = Array.from(new Map(data.map(item => [item[0], item])).values());

    const formattedData = uniqueData.map(item => ({
        x: new Date(item[0]).toISOString(),
        close: item[4],
        high: item[2],
        low: item[3],
        open: item[1]
    }));

    const plotlyHtml = `
        <html>
        <body>
        <div id="chart" style="width: 100%; height: 80vh;"></div>
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
        <script>
            var trace1 = {
                x: ${JSON.stringify(formattedData.map(d => d.x))},
                close: ${JSON.stringify(formattedData.map(d => d.close))},
                high: ${JSON.stringify(formattedData.map(d => d.high))},
                low: ${JSON.stringify(formattedData.map(d => d.low))},
                open: ${JSON.stringify(formattedData.map(d => d.open))},
                type: 'candlestick',
                xaxis: 'x',
                yaxis: 'y'
            };

            var data = [trace1];

            var layout = {
                dragmode: 'zoom',
                margin: {
                    r: 10,
                    t: 25,
                    b: 40,
                    l: 60
                },
                showlegend: false,
                xaxis: {
                    autorange: true,
                    type: 'date',
                    title: 'Date',
                    tickformat: '%Y-%m-%d %H:%M',
                    rangeslider: { visible: false },
                    tickangle: -45,
                },
                yaxis: {
                    autorange: true,
                    title: 'Price',
                    fixedrange: false
                },
                bargap: 0.2
            };

            Plotly.newPlot('chart', data, layout).then(function() {
                const chartElement = document.getElementById('chart');
                if (chartElement) {
                    chartElement.dispatchEvent(new Event('rendered'));
                }
            }).catch(function(err) {
                console.error('Error rendering chart:', err);
            });
        </script>
        </body>
        </html>
    `;

    await page.setContent(plotlyHtml);

    await page.waitForFunction(() => {
        const chartElement = document.getElementById('chart');
        return chartElement && chartElement.hasChildNodes();
    }, { timeout: 10000 });

    const screenshot = await page.screenshot({ encoding: 'binary' });
    await browser.close();
    return Buffer.from(screenshot);
}

export function analyzeData(data: OHLCData[]): AnalysisResult {
    if (data.length < 3) {
        return { movement: 'neutral', explanation: 'Not enough data' };
    }

    const lastCandle = data[data.length - 1];
    const previousCandle = data[data.length - 2];
    const thirdLastCandle = data[data.length - 3];

    const lastClose = lastCandle[4];
    const previousClose = previousCandle[4];
    const thirdLastClose = thirdLastCandle[4];

    if (lastClose > previousClose && previousClose > thirdLastClose) {
        return { movement: 'bullish', explanation: 'The market shows a rising trend.' };
    } else if (lastClose < previousClose && previousClose < thirdLastClose) {
        return { movement: 'bearish', explanation: 'The market shows a declining trend.' };
    } else {
        return { movement: 'neutral', explanation: 'The market is consolidating.' };
    }
}

// Main command execution logic
module.exports = {
    name: "forex",
    aliases: ['fx'],
    category: "Economy",
    code: async (ctx: Ctx, bot: Client) => {
        const userId = ctx?.sender?.jid!
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
            const user = ctx.sender?.jid!;
            // Initialize the activeRegistrations map
const activeRegistrations = new Map();
                // Generate a session ID for the registration process
    const sessionId = generateSessionId(user);

    // Check if the user is already in the middle of registration
    if (activeRegistrations.has(!sessionId)) {
      await ctx.reply('You are already in the process');
      return;
    }

    // Add the session ID to activeRegistrations
    activeRegistrations.set(sessionId, true);
            if (!user) {
                await ctx.reply("🟥 *User not found.*");
                return;
            }

            const userDocSnapshot = await dbHandler.getUser(user);
            if (!userDocSnapshot.exists) {
                await ctx.reply("🟥 *User not found.*");
                return;
            }

            const userData = userDocSnapshot.data();
            const wallet = userData?.wallet || 0;
// Randomly select a pattern
const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
console.log('Selected Pattern:', selectedPattern); // Debugging log

            const candles = generatePatternData(selectedPattern);
            const chartImage = await generateCandlestickChart(candles);

            await ctx.reply({
                image: chartImage,
                caption: "Analyze the chart and make your prediction. Would you like to buy, sell, or hold?"
            });
            const { movement, explanation } = (() => {
                switch (selectedPattern) {
                    case 'bullishEngulfing':
                        return { movement: 'bullish', explanation: 'A Bullish Engulfing pattern was detected, often signaling a reversal to an uptrend.' };
                    case 'bearishEngulfing':
                        return { movement: 'bearish', explanation: 'A Bearish Engulfing pattern was detected, often signaling a reversal to a downtrend.' };
                    case 'doubleBottom':
                        return { movement: 'bullish', explanation: 'A Double Bottom pattern was detected, indicating a potential reversal from a downtrend to an uptrend.' };
                    case 'doubleTop':
                        return { movement: 'bearish', explanation: 'A Double Top pattern was detected, indicating a potential reversal from an uptrend to a downtrend.' };
                    case 'headAndShoulders':
                        return { movement: 'bearish', explanation: 'A Head and Shoulders pattern was detected, often signaling a reversal from an uptrend to a downtrend.' };
                    case 'inverseHeadAndShoulders':
                        return { movement: 'bullish', explanation: 'An Inverse Head and Shoulders pattern was detected, often indicating a reversal from a downtrend to an uptrend.' };
                    case 'hammer':
                        return { movement: 'bullish', explanation: 'A Hammer pattern was detected, suggesting a potential reversal in a downtrend.' };
                    case 'hangingMan':
                        return { movement: 'bearish', explanation: 'A Hanging Man pattern was detected, suggesting a potential reversal in an uptrend.' };
                    case 'doji':
                        return { movement: 'neutral', explanation: 'A Doji pattern was detected, indicating market indecision, often seen in consolidation.' };
                    case 'morningStar':
                        return { movement: 'bullish', explanation: 'A Morning Star pattern was detected, often signaling the beginning of an uptrend.' };
                    case 'eveningStar':
                        return { movement: 'bearish', explanation: 'An Evening Star pattern was detected, often signaling the beginning of a downtrend.' };
                    case 'risingThreeMethods':
                        return { movement: 'bullish', explanation: 'A Rising Three Methods pattern was detected, confirming the continuation of an uptrend.' };
                    case 'fallingThreeMethods':
                        return { movement: 'bearish', explanation: 'A Falling Three Methods pattern was detected, confirming the continuation of a downtrend.' };
                    case 'harami':
                        return { movement: 'neutral', explanation: 'A Harami pattern was detected, indicating a potential pause in the current trend.' };
                    case 'piercingLine':
                        return { movement: 'bullish', explanation: 'A Piercing Line pattern was detected, indicating a potential reversal in a downtrend.' };
                    case 'darkCloudCover':
                        return { movement: 'bearish', explanation: 'A Dark Cloud Cover pattern was detected, indicating a potential reversal in an uptrend.' };
                    case 'spinningTop':
                        return { movement: 'neutral', explanation: 'A Spinning Top pattern was detected, indicating market indecision, often seen in consolidation.' };
                    case 'marubozu':
                        return { movement: 'bullish', explanation: 'A Marubozu pattern was detected, suggesting the beginning of an uptrend.' };
                    case 'shootingStar':
                        return { movement: 'bearish', explanation: 'A Shooting Star pattern was detected, indicating a potential reversal in an uptrend.' };
                    case 'invertedHammer':
                        return { movement: 'bullish', explanation: 'An Inverted Hammer pattern was detected, indicating a potential reversal in a downtrend.' };
                    case 'cupAndHandle':
                        return { movement: 'bullish', explanation: 'A Cup and Handle pattern was detected, suggesting a continuation of an uptrend after consolidation.' };
                    case 'ascendingTriangle':
                        return { movement: 'bullish', explanation: 'An Ascending Triangle pattern was detected, suggesting a continuation of an uptrend.' };
                    case 'descendingTriangle':
                        return { movement: 'bearish', explanation: 'A Descending Triangle pattern was detected, suggesting a continuation of a downtrend.' };
                    case 'symmetricalTriangle':
                        return { movement: 'neutral', explanation: 'A Symmetrical Triangle pattern was detected, often seen during consolidation.' };
                    case 'flag':
                        return { movement: 'bullish', explanation: 'A Flag pattern was detected, indicating a continuation of an uptrend after a brief consolidation.' };
                    case 'pennant':
                        return { movement: 'bullish', explanation: 'A Pennant pattern was detected, suggesting a continuation of an uptrend after a brief consolidation.' };
                    case 'wedge':
                        return { movement: 'neutral', explanation: 'A Wedge pattern was detected, often seen during consolidation or trend reversal.' };
                    case 'risingWedge':
                        return { movement: 'bearish', explanation: 'A Rising Wedge pattern was detected, indicating a potential reversal in an uptrend.' };
                    case 'fallingWedge':
                        return { movement: 'bullish', explanation: 'A Falling Wedge pattern was detected, indicating a potential reversal in a downtrend.' };
                    case 'bullishHarami':
                        return { movement: 'bullish', explanation: 'A Bullish Harami pattern was detected, indicating a potential reversal in a downtrend.' };
                    case 'bearishHarami':
                        return { movement: 'bearish', explanation: 'A Bearish Harami pattern was detected, indicating a potential reversal in an uptrend.' };
                    case 'insideBar':
                        return { movement: 'neutral', explanation: 'An Inside Bar pattern was detected, indicating market indecision or consolidation.' };
                    case 'outsideBar':
                        return { movement: 'neutral', explanation: 'An Outside Bar pattern was detected, indicating market indecision or consolidation.' };
                    case 'railroadTracks':
                        return { movement: 'bullish', explanation: 'A Railroad Tracks pattern was detected, indicating a potential reversal in a downtrend.' };
                    case 'tweezerTops':
                        return { movement: 'bearish', explanation: 'Tweezer Tops pattern was detected, indicating a potential reversal in an uptrend.' };
                    case 'tweezerBottoms':
                        return { movement: 'bullish', explanation: 'Tweezer Bottoms pattern was detected, indicating a potential reversal in a downtrend.' };
                    case 'gappingUp':
                        return { movement: 'bullish', explanation: 'A Gapping Up pattern was detected, suggesting strong buying pressure and the continuation of an uptrend.' };
                    case 'gappingDown':
                        return { movement: 'bearish', explanation: 'A Gapping Down pattern was detected, suggesting strong selling pressure and the continuation of a downtrend.' };
                    case 'priceActionReversal':
                        return { movement: 'reversal', explanation: 'A Price Action Reversal pattern was detected, indicating a reversal of the current trend.' };
                    case 'priceActionContinuation':
                        return { movement: 'continuation', explanation: 'A Price Action Continuation pattern was detected, suggesting the continuation of the current trend.' };
                    case 'breakout':
                        return { movement: 'bullish', explanation: 'A Breakout pattern was detected, suggesting a potential uptrend after consolidation.' };
                    case 'breakdown':
                        return { movement: 'bearish', explanation: 'A Breakdown pattern was detected, suggesting a potential downtrend after consolidation.' };
                    case 'supportBounce':
                        return { movement: 'bullish', explanation: 'A Support Bounce pattern was detected, indicating a continuation of an uptrend after testing support.' };
                    case 'resistanceRejection':
                        return { movement: 'bearish', explanation: 'A Resistance Rejection pattern was detected, indicating a continuation of a downtrend after testing resistance.' };
                    case 'priceChannel':
                        return { movement: 'neutral', explanation: 'A Price Channel pattern was detected, indicating price movement within a range during consolidation.' };
                    case 'movingAverageCrossover':
                        return { movement: 'neutral', explanation: 'A Moving Average Crossover pattern was detected, often used to indicate potential trend changes.' };
                    case 'bollingerBandSqueeze':
                        return { movement: 'neutral', explanation: 'A Bollinger Band Squeeze pattern was detected, indicating low volatility and potential breakout.' };
                    case 'rsiPattern':
                        return { movement: 'neutral', explanation: 'An RSI pattern was detected, suggesting potential overbought or oversold conditions.' };
                    case 'macdCrossover':
                        return { movement: 'neutral', explanation: 'A MACD Crossover pattern was detected, indicating potential momentum change or consolidation.' };
                    default:
                        return { movement: 'neutral', explanation: 'No significant pattern detected.' };
                    }
                })();
            
            const userPrediction = await askQuestion(ctx, "Would you like to buy, sell, or hold?");
            const analysis = analyzeData(candles);
           

            let resultExplanation: string;
            const normalizedUserPrediction = userPrediction.toLowerCase();

            let win = false;
            console.log(movement)
            if (
                (movement === 'bullish' && normalizedUserPrediction === 'buy') ||
                (movement === 'bearish' && normalizedUserPrediction === 'sell') ||
                (movement === 'neutral' && normalizedUserPrediction === 'hold') ||
                (movement === 'reversal' && (normalizedUserPrediction === 'buy' || normalizedUserPrediction === 'sell')) ||
                (movement === 'continuation' && (normalizedUserPrediction === 'buy' || normalizedUserPrediction === 'sell'))
            ) {
                resultExplanation = `Correct! ${explanation}`;
           win = true
            } else {
                resultExplanation = `Incorrect. ${explanation}`;
            }
            await ctx.reply(resultExplanation);

            // Modify wallet based on win/loss
            const amount = Math.floor(wallet * 0.5);  // 10% of wallet
            const newBalance = win ? wallet + amount : wallet - amount;

            await dbHandler.updateUserField(user, 'wallet', newBalance);
            await ctx.reply(`Your new balance is ${newBalance} Bnhz.`);

        } catch (error) {
            console.error('Error:', error);
            await ctx.reply("Sorry, there was an error processing your request.");
        }
    }}