import { sendSuccess } from '../../utils/responseHandler';
import {
  getMiscResoureEntriesService,
  addMiscResoureEntriesService,
} from './miscResoureEntriesService';

const getmiscResourceEntries = async (req, res) => {
  const token = req.user;
  const { resourcetype } = req.query;
  const data = await getMiscResoureEntriesService(token, resourcetype);
  return sendSuccess(res, { data }, ' gettting data successfully');
};
const addMiscResoureEntries = async (req, res) => {
  const token = req.user;
  const payload = req.body;
  const data = await addMiscResoureEntriesService(token, payload);
  return sendSuccess(res, { data }, ' Add data successfully');
};

export { getmiscResourceEntries, addMiscResoureEntries };
