import User from "../../models/User";
import Ticket from "../../models/Ticket";
import UsersInTickets from "../../models/UsersInTicket";

interface Params {
  ticketId: number | string; // Apenas ticketId, para obter todos os usuários
}

const FindUsersByTicketId = async ({
  ticketId
}: Params): Promise<{ ticket: Ticket; users: User[] }> => {
  const usersInTickets = await UsersInTickets.findAll({
    where: {
      ticketId
    },
    include: [
      { model: User, as: "user", attributes: ["id", "name", "email", "profile"] },
      { model: Ticket, as: "ticket", attributes: ["id", "status", "createdAt"] }
    ],
    order: [["createdAt", "DESC"]]
  });

  if (usersInTickets.length === 0) return { ticket: null, users: [] };

  const ticket = usersInTickets[0].ticket; // Pega o ticket apenas uma vez
  const users = usersInTickets.map(userInTicket => userInTicket.user); // Mapeia para obter todos os usuários

  return { ticket, users };
};

export default FindUsersByTicketId;
