import { Request, Response } from "express";
import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";

import AuthUserService from "../services/UserServices/AuthUserService";
import { SendRefreshToken } from "../helpers/SendRefreshToken";
import { RefreshTokenService } from "../services/AuthServices/RefreshTokenService";
import FindUserFromToken from "../services/AuthServices/FindUserFromToken";
import User from "../models/User";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  const { token, serializedUser, refreshToken } = await AuthUserService({
    email,
    password
  });

  SendRefreshToken(res, refreshToken);

  // Set the token in a cookie
  res.cookie('jrt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true em produção, false em desenvolvimento
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' // 'strict' ou 'lax' dependendo do ambiente
  });

  const io = getIO();
  io.to(`user-${serializedUser.id}`).emit(`company-${serializedUser.companyId}-auth`, {
    action: "update",
    user: {
      id: serializedUser.id,
      email: serializedUser.email,
      companyId: serializedUser.companyId,
      whatsappId: serializedUser.whatsappId
    }
  });


  return res.status(200).json({
    token,
    user: serializedUser
  });
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const token: string = req.cookies.jrt

  console.log("Lista de cookies: " + JSON.stringify(req.cookies));

  if (!token) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const { user, newToken, refreshToken } = await RefreshTokenService(res, token);

  SendRefreshToken(res, refreshToken);

  // Update the token in the cookie
  res.cookie('jrt', newToken, {
    httpOnly: true,
  });

  return res.json({ token: newToken, user });
};

export const me = async (req: Request, res: Response): Promise<Response> => {
  const token: string = req.cookies.jrt;

  if (!token) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const user = await FindUserFromToken(token);
  const { id, profile, super: superAdmin, whatsappId } = user;

  return res.json({ id, profile, super: superAdmin, whatsappId });
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.user;
  const user = await User.findByPk(id);
  await user.update({ online: false });

  // Clear the cookie
  res.clearCookie("jrt");

  return res.send();
};
