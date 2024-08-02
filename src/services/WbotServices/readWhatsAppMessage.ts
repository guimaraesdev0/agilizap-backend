import { proto, WASocket } from "@whiskeysockets/baileys";
import WALegacySocket from "@whiskeysockets/baileys"
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";

const ReadWhatsAppMessage = async (messageId: string): Promise<Message> => {
  const message = await Message.findByPk(messageId, {
    include: [
      {
        model: Ticket,
        as: "ticket",
        include: ["contact"]
      }
    ]
  });

  if (!message) {
    throw new AppError("No message found with this ID.");
  }

  const { ticket } = message;

  const messageToRead = await GetWbotMessage(ticket, messageId);

  try {
    const wbot = await GetTicketWbot(ticket);
    const messageDelete = messageToRead as proto.WebMessageInfo;

    const message = messageToRead as Message;
    await (wbot as WASocket).readMessages([message])

  } catch (err) {
    throw new AppError("ERR_READ_WAPP_MSG");
  }
  await message.update({ read: true });

  return message;
};

export default ReadWhatsAppMessage;
