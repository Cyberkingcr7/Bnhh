import { MessageType, Mimetype } from '@adiwajshing/baileys'
import { join } from 'path'
import MessageHandler from '../../Handlers/MessageHandler'
import BaseCommand from '../../lib/BaseCommand'
import WAClient from '../../lib/WAClient'
import { ISimplifiedMessage } from '../../typings'

export default class Command extends BaseCommand {
    constructor(client: WAClient, handler: MessageHandler) {
        super(client, handler, {
            command: 'help',
            description: 'Displays the help menu or shows the info of the command provided',
            category: 'general',
            usage: `${client.config.prefix}help (command_name)`,
            dm: true,
            aliases: ['h']
        })
    }

    run = async (M: ISimplifiedMessage): Promise<void> => {
        const n = [
            './assets/images/help/help.mp4'
        ]
        let bnh = n[Math.floor(Math.random() * n.length)]
        const mn=`
Konnichiwa im a bot , enjoy your day!! 
 My usable commands are listed below
   
        「 Sections 」
 -「 Bots 」
 -「 Config 」
 -「 Dev 」
 -「 Fun && games 」
 -「 Educative 」
 -「 General 」
 -「 Media 」
 -「 Moderation 」
 -「 Weeb 」
 -「 Nsfw (18+) 」
 
 ─────────────────────────
│- ᴜꜱᴇʀ: *${M.sender.username}*
│- ɴᴀᴍᴇ: BNH
│- ᴘʀᴇꜰɪx: ${this.client.config.prefix}
│- ᴏᴡɴᴇʀ: 27780993470 
│- github: https://github.com/Cyberkingcr7/Bnh
╰──────────────────────────
 *Note: Use ${this.client.config.prefix}help <Section_name> to view the section info*
     
     
`
        return void this.client.sendMessage(M.from, { url: bnh }, MessageType.video, {quoted:M.WAMessage,
            mimetype: Mimetype.gif,
            caption:mn }
        )
    }
}
