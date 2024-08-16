import { Op } from "sequelize";
import QuickMessage from "../../models/QuickMessage";
import Company from "../../models/Company";

type Params = {
  companyId: string;
  userId: string;
};

const FindService = async ({ companyId, userId }: Params): Promise<QuickMessage[]> => {
  const quickMessages: QuickMessage[] = await QuickMessage.findAll({
    where: {
      companyId,
      [Op.or]: [
        { userId },
        { showAll: true }
      ]
    },
    include: [{ model: Company, as: "company", attributes: ["id", "name"] }],
    order: [["shortcode", "ASC"]]
  });

  return quickMessages;
};

export default FindService;