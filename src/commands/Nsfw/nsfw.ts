import { MessageType, Mimetype } from '@adiwajshing/baileys'
import { join } from 'path'
import MessageHandler from '../../Handlers/MessageHandler'
import BaseCommand from '../../lib/BaseCommand'
import WAClient from '../../lib/WAClient'
import { ISimplifiedMessage } from '../../typings'

export default class Command extends BaseCommand {
    constructor(client: WAClient, handler: MessageHandler) {
        super(client, handler, {
            command: 'nsfw',
            description: 'shows nsfw section',
            category: 'nsfw',
            usage: `${client.config.prefix}help (command_name)`,
            dm: true,
            aliases: ['9']
        })
    }

    run = async (M: ISimplifiedMessage): Promise<void> => {
        const n = [
            './assets/images/help/nsfw.mp4'
        ]
        let bnh = n[Math.floor(Math.random() * n.length)]
        const mn=`
Konnichiwa ${M.sender.username}
    this is ${this.client.config.prefix}nsfw
 Shows the nsfw info
   
        「 Nsfw 18+ 」
 -「 ${this.client.config.prefix}bj 」
 -「 ${this.client.config.prefix}darkjoke 」
 -「 ${this.client.config.prefix}lesbian 」
 -「 ${this.client.config.prefix}n-neko 」
 -「 ${this.client.config.prefix}n-waifu 」
 -「 ${this.client.config.prefix}trap 」

  *Note: Use ${this.client.config.prefix}help <command_name> to view the command info*`
        return void this.client.sendMessage(M.from, { url: bnh }, MessageType.video, {quoted:M.WAMessage,
            mimetype: Mimetype.gif,
            caption:mn }
        )
    }
}
