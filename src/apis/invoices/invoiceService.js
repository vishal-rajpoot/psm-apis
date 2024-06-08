/* eslint-disable no-param-reassign */
import Logger from '../../utils/logger';
import * as db from '../../utils/db';
import {
  addInvoiceDao,
  addInvoicePrefixDao,
  deleteInvoiceDao,
  getAllInvoiceDao,
  getInvoicePrefixDao,
  getInvoiceYearDao,
  updateInvoiceDao,
} from '../../dao/invoiceDao';
import convertNumberToWords from '../../utils/convertNoToWords';
import { BadRequestError } from '../../utils/appErrors';

const logger = new Logger();

const getAllInvoiceService = async (companyId, year) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    if (!year) {
      throw new BadRequestError('year is missing');
    } else {
      data = await getAllInvoiceDao(conn, companyId, year);
    }
    return data;
  } catch (error) {
    logger.log('error while getting Invoices', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getInvoicePrefixService = async (companyId) => {
  let conn;
  let data;
  let invoiceString = '';
  try {
    conn = await db.fetchConn();
    data = await getInvoicePrefixDao(conn, companyId);
    if (!data) {
      throw new BadRequestError('Please add invoice prefix');
    }
    const invoiceNo = data?.invoice_no;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < invoiceNo.invoice.length; i++) {
      const invoice = invoiceNo.invoice[i];
      if (i === 0) {
        invoiceString += invoice;
      } else {
        invoiceString += `/${invoice}`;
      }
    }
    return invoiceString;
  } catch (error) {
    logger.log('error while getting invoice prefix', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const addInvoicePrefixService = async (companyId, payload) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    data = await addInvoicePrefixDao(conn, companyId, payload);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error while adding Invoice Prefix', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const addTaxService = (payload) => {
  let totalBeforeTax = 0;
  const { products } = payload;
  for (const product of products) {
    totalBeforeTax += product.price;
  }
  const cgst = (totalBeforeTax * 9) / 100;
  const sgst = (totalBeforeTax * 9) / 100;
  const igst = (totalBeforeTax * 18) / 100;
  let updatedPayload = {
    ...payload,
  };
  const totalAmountWithCGSTandSGST = totalBeforeTax + cgst + sgst;
  const totalAmountWithIGST = totalBeforeTax + igst;
  const totalInWords = convertNumberToWords(totalAmountWithCGSTandSGST);
  if (payload.state === payload.address.state || payload.address.state === '') {
    const decimalPart = parseFloat(totalAmountWithCGSTandSGST.toFixed(2));
    updatedPayload = {
      ...payload,
      total_amount_before_tax: totalBeforeTax,
      invoice_total_rupees_in_words: totalInWords,
      add_CGST_9: cgst,
      add_SGST_9: sgst,
      total_amount_GST: cgst + sgst,
      total_amount_after_tax: decimalPart,
    };
  } else if (payload.state !== payload.address.state) {
    const decimalPart = parseFloat(totalAmountWithIGST.toFixed(2));
    updatedPayload = {
      ...payload,
      total_amount_before_tax: totalBeforeTax,
      invoice_total_rupees_in_words: totalInWords,
      add_IGST_9: igst,
      total_amount_GST: igst,
      total_amount_after_tax: decimalPart,
    };
  }
  return updatedPayload;
};

const addInvoiceService = async (companyId, payload) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const updatedPayload = addTaxService(payload);
    const currentDate = new Date();
    const createdYear = currentDate.getFullYear();
    const financialYearStart = new Date(createdYear, 3, 1);

    if (financialYearStart >= currentDate) {
      updatedPayload.financial_year = createdYear - 1;
    } else {
      updatedPayload.financial_year = createdYear;
    }
    data = await addInvoiceDao(conn, companyId, updatedPayload);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error while adding invoice', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const updateInvoiceService = async (id, companyId, payload) => {
  let conn;
  let data;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    const updatedPayload = addTaxService(payload);
    data = await updateInvoiceDao(conn, id, companyId, updatedPayload);
    await conn.commit();
    return data;
  } catch (error) {
    logger.log('error while updating invoice', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const deleteInvoiceService = async (companyId, id) => {
  let conn;
  try {
    conn = await db.fetchConn();
    const data = await deleteInvoiceDao(conn, companyId, id);
    return data;
  } catch (error) {
    logger.log('error while deleting the invoice', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

const getInvoiceYearService = async (companyId) => {
  let conn;
  const financialYears = [];
  try {
    conn = await db.fetchConn();
    const data = await getInvoiceYearDao(conn, companyId);

    let dateString = data[0].created_at;
    const currentDate = new Date();

    dateString = dateString || currentDate;
    let createdYear = dateString.getFullYear();
    const financialYearStart = new Date(createdYear, 3, 1);

    while (financialYearStart <= currentDate) {
      const startYear = createdYear;
      const endYear = createdYear + 1;
      const financialYear = `${startYear}-${endYear}`;
      financialYears.push(financialYear);

      // Move to the next financial year (April 1st)
      financialYearStart.setFullYear(createdYear + 1);
      createdYear += 1;
    }
    return financialYears;
  } catch (error) {
    logger.log('error while getting the invoice years', 'error', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

export {
  getAllInvoiceService,
  getInvoicePrefixService,
  addInvoicePrefixService,
  addInvoiceService,
  updateInvoiceService,
  deleteInvoiceService,
  getInvoiceYearService,
};
