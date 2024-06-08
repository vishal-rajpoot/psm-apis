import { sendSuccess } from '../../utils/responseHandler';
import getHistoryService from './historyService';

const getHistory = async (req, res) => {
  const { userId, companyId } = req.user;
  let user = userId;
  const { id } = req.params;
  if (id !== undefined) {
    user = id;
  }
  let date;
  if (req.query.date) {
    date = req.query.date;
  } else {
    date = new Date().toISOString().slice(0, 10);
  }
  const data = await getHistoryService(date, user, companyId);
  return sendSuccess(
    res,
    { history: data },
    'getting history data successfully'
  );
};

export default getHistory;
