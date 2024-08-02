import express from "express";
import isAuth from "../middleware/isAuth";

import * as UsersInTickets from "../controllers/UserInTicketsController";

const userInTicket = express.Router();

userInTicket.get("/usersInTicket/:ticketId", UsersInTickets.index);
userInTicket.post("/addUserInTicket", isAuth, UsersInTickets.addUser)


export default userInTicket;