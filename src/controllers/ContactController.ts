        import * as Yup from "yup";
        import { Request, Response } from "express";
        import { getIO } from "../libs/socket";



        import ListContactsService from "../services/ContactServices/ListContactsService";
        import CreateContactService from "../services/ContactServices/CreateContactService";
        import ShowContactService from "../services/ContactServices/ShowContactService";
        import UpdateContactService from "../services/ContactServices/UpdateContactService";
        import DeleteContactService from "../services/ContactServices/DeleteContactService";
        import GetContactService from "../services/ContactServices/GetContactService";


        import CheckContactNumber from "../services/WbotServices/CheckNumber";
        import CheckIsValidContact from "../services/WbotServices/CheckIsValidContact";
        import GetProfilePicUrl from "../services/WbotServices/GetProfilePicUrl";
        import AppError from "../errors/AppError";
        import SimpleListService, {
          SearchContactParams
        } from "../services/ContactServices/SimpleListService";
        import ContactCustomField from "../models/ContactCustomField";
        import UserModel from "../models/User";

        type IndexQuery = {
          searchParam: string;
          pageNumber: string;
          whatsappId: any;
        };

        type IndexGetContactQuery = {
          name: string;
          number: string;
        };


        interface ExtraInfo extends ContactCustomField {
          name: string;
          value: string;
        }
        interface ContactData {
          name: string;
          number: string;
          email?: string;
          extraInfo?: ExtraInfo[];
        }

        export const index = async (req: Request, res: Response): Promise<Response> => {
          const { searchParam, pageNumber, whatsappId } = req.query as IndexQuery;
          const { companyId } = req.user;

          const { contacts, count, hasMore } = await ListContactsService({
            searchParam,
            pageNumber,
            companyId,
            whatsappId 
          });

          return res.json({ contacts, count, hasMore });
        };

        export const getContact = async (
          req: Request,
          res: Response
        ): Promise<Response> => {
          const { name, number } = req.body as IndexGetContactQuery;
          const { companyId } = req.user;

          const contact = await GetContactService({
            name,
            number,
            companyId
          });

          return res.status(200).json(contact);
        };

        export const store = async (req: Request, res: Response): Promise<Response> => {
          const { companyId, id:userId } = req.user;
          const newContact: ContactData = req.body;
          newContact.number = newContact.number.replace("-", "").replace(" ", "");

          const schema = Yup.object().shape({
            name: Yup.string().required(),
            number: Yup.string()
              .required()
              .matches(/^\d+$/, "Número inserido com formatado inválido, formato correto: 55990000000")
          });

          try {
            await schema.validate(newContact);
          } catch (err: any) {
            throw new AppError(err.message);
          }

          try {
            await CheckIsValidContact(newContact.number, companyId);
            const validNumber = await CheckContactNumber(newContact.number, companyId);
            const number = validNumber.jid.replace(/\D/g, "");
            newContact.number = number;  
          } catch (error) {
            console.log("Erro ao validar o contato, mas o contato foi adicionado")
          }

          const user = await UserModel.findByPk(userId);
          if (!user) {
            throw new AppError("User not found", 404);
          }
          const whatsappId = user.whatsappId;

          const contact = await CreateContactService({
            ...newContact,
            // profilePicUrl,
            companyId,
            whatsappId
          });

          const io = getIO();
          io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
            action: "create",
            contact
          });

          return res.status(200).json(contact);
        };

        export const show = async (req: Request, res: Response): Promise<Response> => {
          const { contactId } = req.params;
          const { companyId } = req.user;

          const contact = await ShowContactService(contactId, companyId);

          return res.status(200).json(contact);
        };

        export const update = async (
          req: Request,
          res: Response
        ): Promise<Response> => {
          const contactData: ContactData = req.body;
          const { companyId } = req.user;

          const schema = Yup.object().shape({
            name: Yup.string(),
            number: Yup.string().matches(
              /^\d+$/,
              "Invalid number format. Only numbers is allowed."
            )
          });

          try {
            await schema.validate(contactData);
          } catch (err: any) {
            throw new AppError(err.message);
          }

          await CheckIsValidContact(contactData.number, companyId);
          const validNumber = await CheckContactNumber(contactData.number, companyId);
          const number = validNumber.jid.replace(/\D/g, "");
          contactData.number = number;

          const { contactId } = req.params;

          const contact = await UpdateContactService({
            contactData,
            contactId,
            companyId
          });

          const io = getIO();
          io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
            action: "update",
            contact
          });

          return res.status(200).json(contact);
        };

        export const remove = async (
          req: Request,
          res: Response
        ): Promise<Response> => {
          const { contactId } = req.params;
          const { companyId } = req.user;

          await ShowContactService(contactId, companyId);

          await DeleteContactService(contactId);

          const io = getIO();
          io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-contact`, {
            action: "delete",
            contactId
          });

          return res.status(200).json({ message: "Contact deleted" });
        };

        export const list = async (req: Request, res: Response): Promise<Response> => {
          const { name } = req.query as unknown as SearchContactParams;
          const { companyId, id: userId } = req.user;
          const user = await UserModel.findByPk(userId);
          if (!user) {
            throw new AppError("User not found", 404);
          }
          const whatsappId = user.whatsappId;
          const contacts = await SimpleListService({ name, companyId, whatsappId });
        
          return res.json(contacts);
        };
