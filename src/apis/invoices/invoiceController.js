import {
  addInvoicePrefixService,
  addInvoiceService,
  deleteInvoiceService,
  getAllInvoiceService,
  getInvoicePrefixService,
  getInvoiceYearService,
  updateInvoiceService,
} from './invoiceService';

import { sendSuccess } from '../../utils/responseHandler';
import { ValidationError } from '../../utils/appErrors';
import {
  INSERT_INVOICE_PREFIX_SCHEMA,
  INVOICE_SCHEMA,
} from '../../schemas/invoiceSchema';

const getAllInvoices = async (req, res) => {
  const { companyId } = req.user;
  const { year } = req.query;
  const data = await getAllInvoiceService(companyId, year);
  return sendSuccess(
    res,
    { invoices: data },
    'getting All Invoices successfully'
  );
};

const getInvoicePrefix = async (req, res) => {
  const { companyId } = req.user;
  const data = await getInvoicePrefixService(companyId);
  return sendSuccess(
    res,
    { invoice_no: data },
    'getting Invoice prefix successfully'
  );
};

const addInvoicePrefix = async (req, res) => {
  const { companyId } = req.user;
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = INSERT_INVOICE_PREFIX_SCHEMA.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await addInvoicePrefixService(companyId, payload);
  return sendSuccess(
    res,
    { invoice: data },
    'invoice prefix added successfully'
  );
};

const addInvoice = async (req, res) => {
  const { companyId } = req.user;
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = INVOICE_SCHEMA.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await addInvoiceService(companyId, payload);
  return sendSuccess(
    res,
    { invoice_added: data },
    'invoice added successfully'
  );
};

const updateInvoice = async (req, res) => {
  const { id } = req.params;
  const { companyId } = req.user;
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = INVOICE_SCHEMA.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateInvoiceService(id, companyId, payload);
  return sendSuccess(res, { invoice: data }, 'invoice updated successfully');
};

const deleteInvoice = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const data = await deleteInvoiceService(companyId, id);
  return sendSuccess(res, data, 'invoice deleted successfully');
};

const getInvoiceYear = async (req, res) => {
  const { companyId } = req.user;
  const data = await getInvoiceYearService(companyId);
  return sendSuccess(
    res,
    { invoice_years: data },
    'getting Invoice years successfully'
  );
};

export {
  getAllInvoices,
  getInvoicePrefix,
  addInvoicePrefix,
  addInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoiceYear,
};
