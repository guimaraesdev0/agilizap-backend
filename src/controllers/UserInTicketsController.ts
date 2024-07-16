import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";
import FindUsersByTicketId from "../services/UsersInTicket/FindUsersByTicketId";
import UsersInTickets from "../models/UsersInTicket";

type IndexQuery = {
    userId: string;
    ticketId: string;
};

type StoreTicketNoteData = {
    userId: number;
    ticketId: number | 0;
    id?: number | string;
};

type UpdateTicketNoteData = {
    id?: number | string;
    userId?: number | 0;
    ticketId?: number | 0;
};

type QueryFilteredNotes = {
    userId: number | string;
    ticketId: number | string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
    const { ticketId } = req.params as IndexQuery;
  
    const data = await FindUsersByTicketId({
        ticketId
    });
  
    return res.json(data);
};
  
