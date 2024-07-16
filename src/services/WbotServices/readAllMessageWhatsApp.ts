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
      read: false,
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

  const ticket = messages[0].ticket;

  try {
    const wbot = await GetTicketWbot(ticket);
    messages.forEach(async msg => {
      let data = JSON.parse(msg.dataValues.dataJson);
      await (wbot as WASocket).readMessages([data.key])
    });
    return;

  } catch (error) {
    console.log("Ocorreu um erro: " + error)
  }


  return messages;
};

export default ReadAllWhatsAppMessage;
