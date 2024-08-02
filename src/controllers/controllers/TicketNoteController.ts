import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";
import TicketNote from "../models/TicketNote";

import ListTicketNotesService from "../services/TicketNoteService/ListTicketNotesService";
import CreateTicketNoteService from "../services/TicketNoteService/CreateTicketNoteService";
import UpdateTicketNoteService from "../services/TicketNoteService/UpdateTicketNoteService";
import ShowTicketNoteService from "../services/TicketNoteService/ShowTicketNoteService";
import FindAllTicketNotesService from "../services/TicketNoteService/FindAllTicketNotesService";
import DeleteTicketNoteService from "../services/TicketNoteService/DeleteTicketNoteService";
import FindNotesByContactIdAndTicketId from "../services/TicketNoteService/FindNotesByContactIdAndTicketId";
import CreateService from "../services/AnnouncementService/CreateService";
import { getIO } from "../libs/socket";
import Contact from "../models/Contact";
import User from "../models/User";
import Ticket from "../models/Ticket";



type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

type MentionedUser = {
  id: number;
  name: string;
}

type StoreTicketNoteData = {
  note: string;
  userId: number;
  contactId: number | 0;
  ticketId: number | 0;
  usersmentioned?: [MentionedUser];
  id?: number | string;
};

type StoreAnnounceData = {
  priority: string;
  title: string;
  text: string;
  status: string;
  companyId: number;
  ticketUUID?: string;
  mediaPath?: string;
  mediaName?: string;
};

type UpdateTicketNoteData = {
  note: string;
  id?: number | string;
  userId?: number | 0;
  contactId?: number | 0;
  ticketId?: number | 0;
};

type QueryFilteredNotes = {
  contactId: number | string;
  ticketId: number | string;
};



export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { ticketNotes, count, hasMore } = await ListTicketNotesService({
    searchParam,
    pageNumber
  });

  return res.json({ ticketNotes, count, hasMore });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const ticketNotes: TicketNote[] = await FindAllTicketNotesService();

  return res.status(200).json(ticketNotes);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const newTicketNote: StoreTicketNoteData = req.body;
  const { id: userId, companyId } = req.user;

  const detailContact: any = await Contact.findOne({
    where: { id: newTicketNote.contactId }
  });

  const detailUser: any = await User.findOne({
    where: { id: userId }
  });

  const detailTicket: any = await Ticket.findOne({
    where: { id: newTicketNote.ticketId }
  })

  const userMentions = newTicketNote.usersmentioned
    .map(user => `@${user.name}`)
    .join(", ");

  const data: StoreAnnounceData = {
    title: `${detailUser.dataValues.name} mencionou você em uma observação do contato: ${detailContact.dataValues.number}`,
    text: `${userMentions} ${newTicketNote.note}`,
    priority: "3",
    status: "true",
    companyId: detailUser.dataValues.companyId,
    ticketUUID: detailTicket.dataValues.uuid
  };

  const schema = Yup.object().shape({
    note: Yup.string().required()
  });

  try {
    await schema.validate(newTicketNote);
  } catch (err) {
    throw new AppError(err.message);
  }

  const record = await CreateService({
    ...data,
    companyId
  });

  const io = getIO();
  io.emit(`company-announcement`, {
    action: "create",
    record,
    mentionedUsers: newTicketNote.usersmentioned
  });

  const ticketNote = await CreateTicketNoteService({
    ...newTicketNote,
    userId
  });

  return res.status(200).json(ticketNote);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  const ticketNote = await ShowTicketNoteService(id);

  return res.status(200).json(ticketNote);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const ticketNote: UpdateTicketNoteData = req.body;

  const schema = Yup.object().shape({
    note: Yup.string()
  });

  try {
    await schema.validate(ticketNote);
  } catch (err) {
    throw new AppError(err.message);
  }

  const recordUpdated = await UpdateTicketNoteService(ticketNote);

  return res.status(200).json(recordUpdated);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  await DeleteTicketNoteService(id);

  return res.status(200).json({ message: "Observação removida" });
};

export const findFilteredList = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { contactId, ticketId } = req.query as QueryFilteredNotes;
    const notes: TicketNote[] = await FindNotesByContactIdAndTicketId({
      contactId,
      ticketId
    });

    return res.status(200).json(notes);
  } catch (e) {
    return res.status(500).json({ message: e });
  }
};
