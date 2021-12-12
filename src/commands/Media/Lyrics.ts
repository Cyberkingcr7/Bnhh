import { MessageType } from '@adiwajshing/baileys'
import MessageHandler from '../../Handlers/MessageHandler'
import BaseCommand from '../../lib/BaseCommand'
import WAClient from '../../lib/WAClient'
import { IParsedArgs, ISimplifiedMessage } from '../../typings'
import yts from 'yt-search'
import { getSong, getLyrics } from 'ultra-lyrics'
import axios from 'axios'

export default class Command extends BaseCommand {
    constructor(client: WAClient, handler: MessageHandler) {
        super(client, handler, {
            command: 'lyrics',
            description: 'Gives you the lyrics of the given song.',
            category: 'media',
            aliases: ['ly'],
            usage: `${client.config.prefix}lyrics [song_name]`,
            baseXp: 20
        })
    }
    run = async (M: ISimplifiedMessage, { joined }: IParsedArgs): Promise<void> => {
        if (!joined) return void M.reply('Give me a song name, Baka!')
        const bnh = joined.trim()
        await axios.get(`https://api.lyrics.ovh/v1/${bnh}`)
        .then((response) => {
                // console.log(response);
                const text = `💫 *Lyrics:* ${response.data.lyrics}\n`
                M.reply(text);
            }).catch(err => {
                M.reply(`Couldn't find the lyrics of *${bnh}*\n `)
            }
            )
    };
}
