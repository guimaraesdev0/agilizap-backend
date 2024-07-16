import { proto, WASocket } from "@whiskeysockets/baileys";
import WALegacySocket from "@whiskeysockets/baileys";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";

const ReadAllWhatsAppMessage = async (ticketId: string): Promise<Message[]> => {

  console.log("Ler todas as mensagens do ticket " + ticketId)

  const messages = await Message.findAll({
    where: {
      ticketId: ticketId,
      fromMe: false,
      read: true,
    },
    include: [
      {
        model: Ticket,
        as: "ticket",
        include: ["contact"]
      }
    ],
    order: [['createdAt', 'DESC']],
    limit: 100
  }) as any;

  console.log("Resultado da pesquisa: " + JSON.stringify(messages))

  const ticket = messages[0].ticket;

  console.log("TICKET : " + JSON.stringify(ticket))

  try {
    const wbot = await GetTicketWbot(ticket);
    messages.forEach(async msg => {
      let data = JSON.parse(msg.dataValues.dataJson);
      await (wbot as WASocket).readMessages([data.key])
    });
    return;

  } catch (error) {
    console.log("Ocorreu um erro: " + JSON.stringify(error))
  }


  return messages;
};

export default ReadAllWhatsAppMessage;
