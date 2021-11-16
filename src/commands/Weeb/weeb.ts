import { MessageType, Mimetype } from '@adiwajshing/baileys'
import { join } from 'path'
import MessageHandler from '../../Handlers/MessageHandler'
import BaseCommand from '../../lib/BaseCommand'
import WAClient from '../../lib/WAClient'
import { ISimplifiedMessage } from '../../typings'

export default class Command extends BaseCommand {
    constructor(client: WAClient, handler: MessageHandler) {
        super(client, handler, {
            command: 'weeb',
            description: 'shows weeb section',
            category: 'weeb',
            usage: `${client.config.prefix}help (command_name)`,
            dm: true,
            aliases: ['10']
        })
    }

    run = async (M: ISimplifiedMessage): Promise<void> => {
        const n = [
            './assets/images/help/weeb.mp4'
        ]
        let bnh = n[Math.floor(Math.random() * n.length)]
        const mn=`
Konnichiwa ${M.sender.username}
    this is ${this.client.config.prefix}weeb
 Shows the weeb info
   
        「 Weeb 」
 -「 ${this.client.config.prefix}aq 」
 -「 ${this.client.config.prefix}character 」
 -「 ${this.client.config.prefix}loli 」
 -「 ${this.client.config.prefix}waifu 」
 -「 ${this.client.config.prefix}gen 」
 -「 ${this.client.config.prefix}husbando 」
 -「 ${this.client.config.prefix}rpaper 」
 -「 ${this.client.config.prefix}meguminpaper 」
 -「 ${this.client.config.prefix}shinobu-paper 」
 -「 ${this.client.config.prefix}anime-line 」
 -「 ${this.client.config.prefix}kitsune 」
 
  *Note: Use ${this.client.config.prefix}help <command_name> to view the command info*`
        return void this.client.sendMessage(M.from, { url: bnh }, MessageType.video, {quoted:M.WAMessage,
            mimetype: Mimetype.gif,
            caption:mn }
        )
    }
}
