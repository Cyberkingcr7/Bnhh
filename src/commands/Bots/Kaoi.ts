import MessageHandler from '../../Handlers/MessageHandler'
import BaseCommand from '../../lib/BaseCommand'
import WAClient from '../../lib/WAClient'
import { ISimplifiedMessage } from '../../typings'

export default class Command extends BaseCommand {
    constructor(client: WAClient, handler: MessageHandler) {
        super(client, handler, {
            command: 'info',
            description: 'Displays the info',
            category: 'bots',
            usage: `${client.config.prefix}info`,
            baseXp: 200
        })
    }

    run = async (M: ISimplifiedMessage): Promise<void> => {
        return void M.reply(
            `👾 *BNH* 👾\n\n🍀 *Description:* Maintained Fork of WhatsApp Botto Void\n\n🌐 *URL:* https://github.com/Cyberkingcr7/Bnh \n Need help? Message me on wa.me/27780993470`
        ).catch((reason: Error) => M.reply(`an error occurred, Reason: ${reason}`))
    }
}
