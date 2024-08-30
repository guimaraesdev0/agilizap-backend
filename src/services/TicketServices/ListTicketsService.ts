import { Op, fn, where, col, Filterable, Includeable, Sequelize } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";

import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import User from "../../models/User";
import ShowUserService from "../UserServices/ShowUserService";
import Tag from "../../models/Tag";
import TicketTag from "../../models/TicketTag";
import { intersection } from "lodash";
import Whatsapp from "../../models/Whatsapp";
import UsersInTickets from "../../models/UsersInTicket";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string;
  date?: string;
  updatedAt?: string;
  showAll?: string;
  orderBy?: string;
  userId: string;
  withUnreadMessages?: string;
  queueIds: number[];
  tags: number[];
  users: number[];
  companyId: number;
}

interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
}

const ListTicketsService = async ({
  searchParam = "",
  pageNumber = "1",
  queueIds,
  tags,
  users,
  status,
  date,
  updatedAt,
  showAll,
  orderBy,
  userId,
  withUnreadMessages,
  companyId
}: Request): Promise<Response> => {
  let whereCondition: Filterable["where"] = {
    companyId
  };
  let includeCondition: Includeable[];

  includeCondition = [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "email", "profilePicUrl"]
    },
    {
      model: Queue,
      as: "queue",
      attributes: ["id", "name", "color"]
    },
    {
      model: User,
      as: "user",
      attributes: ["id", "name", "whatsappId"]
    },
    {
      model: Tag,
      as: "tags",
      attributes: ["id", "name", "color"]
    },
    {
      model: Whatsapp,
      as: "whatsapp",
      attributes: ["name"]
    },
    {
      model: UsersInTickets,
      as: "usersInTicket",
      attributes: ["userId"],
      where: { userId },
      required: false
    }
  ];

  const user = await ShowUserService(userId);

  // Modificação principal: Retornar tickets onde o userId faz parte do UsersInTicket
  whereCondition = {
    ...whereCondition,
    [Op.or]: [
      { "$usersInTicket.userId$": userId },
      { userId: userId },
      { status: "pending" }
    ]
  };

  whereCondition = {
    ...whereCondition,
    "whatsappId": user.whatsappId
  };

  if (status) {
    whereCondition = {
      ...whereCondition,
      status
    };
  }

  // Resto do código permanece o mesmo...

  const limit = 40;
  const offset = limit * (+pageNumber - 1);

  const sortOrder = orderBy || "DESC";

  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: whereCondition,
    include: includeCondition,
    distinct: true,
    limit,
    offset,
    order: [["updatedAt", sortOrder]],
    subQuery: false
  });

  const hasMore = count > offset + tickets.length;

  return {
    tickets,
    count,
    hasMore
  };
};

export default ListTicketsService;
