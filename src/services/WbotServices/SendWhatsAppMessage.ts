import * as Sentry from "@sentry/node";
import { WAMessage } from "@whiskeysockets/baileys";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";

import formatBody from "../../helpers/Mustache";
import { map_msg } from "../../utils/global";
import { parseJSON } from "date-fns";



interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
}

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg
}: Request): Promise<WAMessage> => {
  let options = {};
  const wbot = await GetTicketWbot(ticket);


  const number = `${ticket.contact.number}@${
    ticket.isGroup ? "g.us" : "s.whatsapp.net"
  }`;
  console.log("number", number);

  const lastMessage = await Message.findOne({
    where: {
      ticketId: ticket.id,
      fromMe: false
    },
    order: [['createdAt', 'DESC']]
  }) as any;





  if (quotedMsg) {
      const chatMessages = await Message.findOne({
        where: {
          id: quotedMsg.id
        }
      });

      const msgFound = JSON.parse(chatMessages.dataJson);
      
      console.log(`MENSAGEM CHAT MESSAGES: ${JSON.stringify(chatMessages)}`)

      if (chatMessages.mediaType == "image") {
        console.log("RESPONDENDO IMAGEM")
        if (chatMessages) {
          options = {
            quoted: {
              key: msgFound.key,
              message:{
                imageMessage: msgFound.message.imageMessage
              },
              readMessages:msgFound.key
            },
            readMessages:msgFound.key
          }
        }
      }

      if (chatMessages.mediaType == "extendedTextMessage") {
        console.log("RESPONDENDO mensagem")

        if (chatMessages) {
  
          options = {
            quoted: {
              key: msgFound.key,
              message: {
                extendedTextMessage: msgFound.message.extendedTextMessage
              },
              readMessages:msgFound.key
            },
            readMessages:msgFound.key
  
          };
        }        
      }
  }

  try {
    console.log('body:', body);
    map_msg.set(number, body);
    console.log(`OPTIONS: ` + JSON.stringify(options))
    const sentMessage = await wbot.sendMessage(number, {
        text: formatBody(body, ticket.contact)
      },
      {
        ...options
      }
    );

    try {
      await ticket.update({ lastMessage: formatBody(body, ticket.contact) });
      const lastMessageKey = JSON.parse(lastMessage.dataValues.dataJson);
      await wbot.readMessages([lastMessageKey.key]);      
    } catch (error) {
      throw new AppError("ERR_SENDING_WAPP_MSG");
    }
  
    return sentMessage;
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
}  

export default SendWhatsAppMessage;
