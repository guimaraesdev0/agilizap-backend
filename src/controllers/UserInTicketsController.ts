import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";
import FindUsersByTicketId from "../services/UsersInTicket/FindUsersByTicketId";
import UsersInTickets from "../models/UsersInTicket";
import CreateUsersInTicket from "../services/UsersInTicket/CreateUsersInTicket";
import UsersInTicket from "../models/UsersInTicket";
import { getIO } from "../libs/socket";
import Ticket from "../models/Ticket";


type IndexQuery = {
    userId: string;
    ticketId: string;
};

type addUser = {
    ticketid: number;
    users: Array<{ id: number, name: string }>;
}

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


export const addUser = async (req: Request, res: Response): Promise<Response> => {
    const { ticketid, users } = req.body as addUser;

    console.log(ticketid)
    try {
        for (const user of users) {
            const isParticipant = await UsersInTicket.findOne({
                where: { ticketId: req.body.ticketid, userId: user.id }
            });

            if (!isParticipant) {
                await UsersInTicket.create({
                    ticketId: req.body.ticketid,
                    userId: user.id,
                });
            }

            const ticket = await Ticket.findOne({
                where: { id: req.body.ticketid }
            }) as any

        }

        return res.status(200).json({ message: "Users added successfully" });
    } catch (error) {
        console.error("Ocorreu um erro ao adicionar os agentes na lista de tickets: ", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}