import { sendSuccess } from '../../utils/responseHandler';
import { uploadXLSX } from '../../utils/convertjson';

import {
  uploadSalesColletionService,
  uploadCustomerSalesColletionService,
} from './salesCollectionFileService';

const uploadSalesCollectionFile = async (req, res) => {
  const excelData = await uploadXLSX(req, res);
  const data = await uploadSalesColletionService(excelData, req);
  return sendSuccess(
    res,
    { product: data },
    'Sales Collection bulk upload successfully'
  );
};

const uploadCustomerCollectionFile = async (req, res) => {
  const excelData = await uploadXLSX(req, res);
  const data = await uploadCustomerSalesColletionService(excelData, req);
  return sendSuccess(
    res,
    { product: data },
    'customer Sales Collection bulk upload successfully'
  );
};
export { uploadCustomerCollectionFile, uploadSalesCollectionFile };
