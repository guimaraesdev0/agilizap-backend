import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";
import authConfig from "../config/auth";

interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  companyId: number;
  iat: number;
  exp: number;
}

const isAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    const error = new AppError("ERR_SESSION_EXPIRED", 401);
    logger.warn({ message: error.message, statusCode: error.statusCode });
    throw error;
  }

  const [, token] = authHeader.split(" ");

  try { 
    // Log the token for debugging purposes
    logger.info({ message: "Attempting to verify token " + token });

    const decoded = verify(token, authConfig.secret) as TokenPayload;
    const { id, profile, companyId } = decoded;
    req.user = {
      id,
      profile,
      companyId
    };

    logger.info({ message: "Token verified successfully", user: req.user });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    const error = new AppError(`Invalid token: ${errorMessage}`, 403);
    logger.warn({ message: error.message, statusCode: error.statusCode });
    throw error;
  }

  return next();
};

export default isAuth;
