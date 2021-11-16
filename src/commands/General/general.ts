import { MessageType, Mimetype } from '@adiwajshing/baileys'
import { join } from 'path'
import MessageHandler from '../../Handlers/MessageHandler'
import BaseCommand from '../../lib/BaseCommand'
import WAClient from '../../lib/WAClient'
import { ISimplifiedMessage } from '../../typings'

export default class Command extends BaseCommand {
    constructor(client: WAClient, handler: MessageHandler) {
        super(client, handler, {
            command: 'genera;',
            description: 'shows general section',
            category: 'fun',
            usage: `${client.config.prefix}help (command_name)`,
            dm: true,
            aliases: ['5']
        })
    }

    run = async (M: ISimplifiedMessage): Promise<void> => {
        const n = [
            './assets/images/help/help.mp4'
        ]
        let bnh = n[Math.floor(Math.random() * n.length)]
        const mn=`
Konnichiwa ${M.sender.username}
    this is ${this.client.config.prefix}general
 Shows the fun info
   
        「 General 」
 -「 ${this.client.config.prefix}admin 」
 -「 ${this.client.config.prefix}delete 」
 -「 ${this.client.config.prefix}help 」
 -「 ${this.client.config.prefix}hi 」
 -「 ${this.client.config.prefix}invitelink 」
 -「 ${this.client.config.prefix}mod 」
  -「 ${this.client.config.prefix}profile 」
 -「 ${this.client.config.prefix}xp 」

  *Note: Use ${this.client.config.prefix}help <command_name> to view the command info*`
        return void this.client.sendMessage(M.from, { url: bnh }, MessageType.video, {quoted:M.WAMessage,
            mimetype: Mimetype.gif,
            caption:mn }
        )
    }
}
