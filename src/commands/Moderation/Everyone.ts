import MessageHandler from '../../Handlers/MessageHandler'
import BaseCommand from '../../lib/BaseCommand'
import WAClient from '../../lib/WAClient'
import { IParsedArgs, ISimplifiedMessage } from "../../typings";
import { MessageType, Mimetype } from "@adiwajshing/baileys";

export default class Command extends BaseCommand {
    constructor(client: WAClient, handler: MessageHandler) {
        super(client, handler, {
            command: 'ping',
            description: 'Tags all users in group chat',
            aliases: ['all', 'tagall'],
            category: 'general',
            usage: `${client.config.prefix}everyone`,
            adminOnly: true,
            baseXp: 20
        })
    }

    run = async (
		M: ISimplifiedMessage,
		{ joined }: IParsedArgs
	): Promise<void> => {
const term = joined.trim() 
        
        return void (await M.reply(
            `${term}\n`,
            undefined,
            undefined,
            M.groupMetadata?.participants.map((user) => user.jid)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ).catch((reason: any) => M.reply(`an error occurred, Reason: ${reason}`)))
    }
}
