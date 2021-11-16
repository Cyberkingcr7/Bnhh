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
Konnichiwa *${M.sender.username}* im bnh 
     My prefix is "${this.client.config.prefix}"
 The usable commands are listed below
   
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
 
 *Note: Use ${this.client.config.prefix}help <Section_name> to view the section info*
     
     
`
        return void this.client.sendMessage(M.from, { url: bnh }, MessageType.video, {quoted:M.WAMessage,
            mimetype: Mimetype.gif,
            caption:mn }
        )
    }
}
