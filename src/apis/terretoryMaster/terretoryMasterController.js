import { sendSuccess } from '../../utils/responseHandler';
import { uploadXLSX } from '../../utils/convertjson';

import {
  uploadTerretoryReportService,
  getTerretoryDetilsService,
} from './terretoryMasteService';

const uploadTerretorymasterFile = async (req, res) => {
  const token = req.user;
  const excelData = await uploadXLSX(req, res);
  const data = await uploadTerretoryReportService(token, excelData);
  return sendSuccess(res, data, 'Terretory Report uploaded successfully');
};

const getTerretoryDetils = async (req, res) => {
  const token = req.user;
  const data = await getTerretoryDetilsService(token);
  return sendSuccess(
    res,
    { territoryMaster: data },
    ' gettting Terretory successfully'
  );
};

export { uploadTerretorymasterFile, getTerretoryDetils };
