import Queue from "../models/Queue";
import Company from "../models/Company";
import User from "../models/User";
import Setting from "../models/Setting";

interface SerializedUser {
  id: number;
  name: string;
  email: string;
  profile: string;
  companyId: number;
  whatsappId: number;
  company: Company | null;
  super: boolean;
  queues: Queue[];
  allTicket: string,
}

export const SerializeUser = async (user: User): Promise<SerializedUser> => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    companyId: user.companyId,
    whatsappId: user.whatsappId,
    company: user.company,
    super: user.super,
    queues: user.queues,
	allTicket: user.allTicket,
  };
};
