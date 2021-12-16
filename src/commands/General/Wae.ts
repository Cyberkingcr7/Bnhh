const eco = require('discord-mongoose-economy');
const ty = eco.connect('mongodb+srv://das:das1234@cluster0.1ydfc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');
import MessageHandler from '../../Handlers/MessageHandler'
import BaseCommand from '../../lib/BaseCommand'
import WAClient from '../../lib/WAClient'
import { ISimplifiedMessage } from '../../typings'
import request from '../../lib/request'
import axios from 'axios'
import { MessageType } from '@adiwajshing/baileys'


run = async (M: ISimplifiedMessage): Promise<void> => {
        if (M.quoted?.sender) M.mentioned.push(M.quoted.sender)
        const user = M.mentioned[0] ? M.mentioned[0] : M.sender.jid
        let username = user === M.sender.jid ? M.sender.username : '🤷🏽‍♂️'
        if (!username) {
            // const contact = this.client.getContact(user)
            // username = contact.notify || contact.vname || contact.name || user.split('@')[0]
            username = user.split('@')[0]
        }
const { data } = await axios.get('https://uploader.hardianto.xyz/uploads/recfile-1639643348898.jpeg')
const cara = 'cara'
const balance = await eco.balance(user, cara); //Returns wallet, bank, and bankCapacity. Also creates a USer if it doesn't exist.
        const buffer = await request.buffer(data.url).catch((e) => {
            return void M.reply(e.message)
        })
        while (true) {
            try {
                M.reply(
                    buffer || 'Could not fetch image. Please try again later',
                    MessageType.image,
                    undefined,
                    undefined,
                    `${username} *wallet💰: ${balance.wallet}\n\nBank🏦: ${balance.bank}/${balance.bankCapacity} *`,
                    undefined
                ).catch((e) => {
                    console.log(`This error occurs when an image is sent via M.reply()\n Child Catch Block : \n${e}`)
                    // console.log('Failed')
                    M.reply(`Could not fetch image. Here's the URL: ${data.url}`)

}} 


