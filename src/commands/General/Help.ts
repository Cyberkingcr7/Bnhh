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


        

        M.reply('
─────────────────────────

│- *ᴜꜱᴇʀ: ${M.sender.username}*

│- *ɴᴀᴍᴇ: ᴄᴏʟᴇ*

│- *ᴘʀᴇꜰɪx: ${this.client.config.prefix}*

│- *ᴏᴡɴᴇʀ: ꜱᴀᴠᴀɢᴇ ɢᴏᴅ*

╰──────────────────────────

*☆[ SECTIONS ]☆*

*1. Bots 🤖*

*2. Config ⚙️*

*3. Dev 🌟*

*4. Fun 💘*

*5. Educative 👨‍🏫*

*6. General 🎃*

*7. Media 🖤*

*8. Moderation 👑*

*9. Weeb 👀*

*10. Nsfw 🔞*

 *Note: Use ${this.client.config.prefix}<Section_name> or <Section_number> to view the section info. E.g ${this.client.config.prefix}bot/1*
     ') 

} 
} 
