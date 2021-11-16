import { MessageType, Mimetype } from '@adiwajshing/baileys'
import { join } from 'path'
import MessageHandler from '../../Handlers/MessageHandler'
import BaseCommand from '../../lib/BaseCommand'
import WAClient from '../../lib/WAClient'
import { ISimplifiedMessage } from '../../typings'

export default class Command extends BaseCommand {
    constructor(client: WAClient, handler: MessageHandler) {
        super(client, handler, {
            command: 'fun',
            description: 'shows fun section',
            category: 'fun',
            usage: `${client.config.prefix}help (command_name)`,
            dm: true,
            aliases: ['5']
        })
    }

    run = async (M: ISimplifiedMessage): Promise<void> => {
        const n = [
            './assets/images/help/help6.mp4'
        ]
        let bnh = n[Math.floor(Math.random() * n.length)]
        const mn=`
Konnichiwa ${M.sender.username}
    this is ${this.client.config.prefix}fun
 Shows the fun info
   
        「 Fun && games 」
 -「 ${this.client.config.prefix}Bnh 」
 -「 ${this.client.config.prefix}fact 」
 -「 ${this.client.config.prefix}joke 」
 -「 ${this.client.config.prefix}quote 」
 -「 ${this.client.config.prefix}re 」
 -「 ${this.client.config.prefix}ship 」
 -「 ${this.client.config.prefix}trigger 」
 -「 ${this.client.config.prefix}advice 」
 -「 ${this.client.config.prefix}jail 」
 -「 ${this.client.config.prefix}why 」
 -「 ${this.client.config.prefix}chess 」

  *Note: Use ${this.client.config.prefix}help <command_name> to view the command info*`
        return void this.client.sendMessage(M.from, { url: bnh }, MessageType.video, {quoted:M.WAMessage,
            mimetype: Mimetype.gif,
            caption:mn }
        )
    }
}
