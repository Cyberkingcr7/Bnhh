import { MessageType } from '@adiwajshing/baileys'
import MessageHandler from '../../Handlers/MessageHandler'
import BaseCommand from '../../lib/BaseCommand'
import WAClient from '../../lib/WAClient'
import { IParsedArgs, ISimplifiedMessage } from "../../typings"; 

export default class Command extends BaseCommand {
    constructor(client: WAClient, handler: MessageHandler) {
        super(client, handler, {
            command: 'rep',
            aliases: ['report'],
            description: 'Get the group invite link',
            category: 'general',
            usage: `${client.config.prefix}invite`,
            baseXp: 10
        })
    }

    run = async (

		M: ISimplifiedMessage,		{ joined }: IParsedArgs

	): Promise<void> => {
        // check if Bot is the admin
      const code = 'https://chat.whatsapp.com/FDT3xmbV2VT8W9JtCK5WOF' 
             const term = joined.trim()
            await this.client.sendMessage(
               // enter your unique gid`120363039316925852@g.us`,
                `${term} by ${M.sender.username}`,
                MessageType.text
            );
            return void M.reply('Sent the bot admin your report N.b if you used this command for fun you will be banned!!')
        }}
