import { MessageType, Mimetype } from '@adiwajshing/baileys'
import { join } from 'path'
import MessageHandler from '../../Handlers/MessageHandler'
import BaseCommand from '../../lib/BaseCommand'
import WAClient from '../../lib/WAClient'
import { ISimplifiedMessage } from '../../typings'

export default class Command extends BaseCommand {
    constructor(client: WAClient, handler: MessageHandler) {
        super(client, handler, {
            command: 'moderation',
            description: 'shows fun section',
            category: 'moderation',
            usage: `${client.config.prefix}help (command_name)`,
            dm: true,
            aliases: ['8']
        })
    }

    run = async (M: ISimplifiedMessage): Promise<void> => {
        const n = [
            './assets/images/help/help.mp4'
        ]
        let bnh = n[Math.floor(Math.random() * n.length)]
        const mn=`
Konnichiwa ${M.sender.username}
    this is ${this.client.config.prefix}moderation
 Shows the moderation info
   
        「 moderation 」
 -「 ${this.client.config.prefix}activate : cmd , invitelink , nsfw , mod , events , safe 」
 -「 ${this.client.config.prefix}deactivate 」
 -「 ${this.client.config.prefix}close 」
 -「 ${this.client.config.prefix}demote 」
 -「 ${this.client.config.prefix}ping 」
 -「 ${this.client.config.prefix}gset 」
 -「 ${this.client.config.prefix}open 」
 -「 ${this.client.config.prefix}close 」
 -「 ${this.client.config.prefix}promote 」
 -「 ${this.client.config.prefix}purge 」
 -「 ${this.client.config.prefix}revoke 」
  *Note: Use ${this.client.config.prefix}help <command_name> to view the command info*`
        return void this.client.sendMessage(M.from, { url: bnh }, MessageType.video, {quoted:M.WAMessage,
            mimetype: Mimetype.gif,
            caption:mn }
        )
    }
}
