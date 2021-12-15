import { MessageType, Mimetype } from '@adiwajshing/baileys'
import { join } from 'path'
import MessageHandler from '../../Handlers/MessageHandler'
import BaseCommand from '../../lib/BaseCommand'
import WAClient from '../../lib/WAClient'
import { ISimplifiedMessage } from '../../typings'

export default class Command extends BaseCommand {
    constructor(client: WAClient, handler: MessageHandler) {
        super(client, handler, {
            command: 'ract',
            description: 'shows bot section',
            category: 'fun',
            usage: `${client.config.prefix}help (command_name)`,
            dm: true,
            aliases: ['1']
        })
    }

    run = async (M: ISimplifiedMessage): Promise<void> => {
        const n = [
            './assets/images/help/help2.mp4','./assets/images/Reactions/giphy (1).gif','assets/images/Reactions/giphy.gif', '. /assets/images/Reactions/hot-spank-butt.gif' ]
        let bnh = n[Math.floor(Math.random() * n.length)]
        const mn=`here you go`
        return void this.client.sendMessage(M.from, { url: bnh }, MessageType.video, {quoted:M.WAMessage,
            mimetype: Mimetype.gif,
            caption: }
        )
    }
}
