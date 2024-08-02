import * as Yup from "yup";
import AppError from "../../errors/AppError";
import TicketNote from "../../models/TicketNote";
import UsersInTickets from "../../models/UsersInTicket";


interface UsersInTicketData {
  userId: number | string;
  ticketId: number | string;
}

const CreateUsersInTicket = async (
  ticketNoteData: UsersInTicketData
): Promise<UsersInTickets> => {

  const userInTicket = await UsersInTickets.create(ticketNoteData);

  return userInTicket;
};

export default CreateUsersInTicket;
