import XLSX from 'xlsx';
import { BadRequestError } from './appErrors.js';
import { NOT_FOUND_MESSAGE } from './constants.js';

const uploadXLSX = async (req) => {
  if (req.file?.filename === null || req.file?.filename === 'undefined') {
    throw new BadRequestError(`File ${NOT_FOUND_MESSAGE}`);
  } else {
    const filePath = `uploads/${req.file?.filename}`;
    const workbook = XLSX.readFile(filePath);
    const sheet_name_list = workbook.SheetNames;
    const jsonData = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]]
    );
    if (jsonData.length === 0) {
      throw new BadRequestError('File is empty');
    }
    const excelData = jsonData;
    return excelData;
  }
};

const fatchexcel = async () => {
  try {
    const filePath = 'src/apis/cronwiseimport/Material_Master.xlsx';

    const workbook = XLSX.readFile(filePath);
    const sheet_name_list = workbook.SheetNames;
    const jsonData = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]]
    );
    if (jsonData.length === 0) {
      throw new BadRequestError('File is empty');
    }
    const excelData = jsonData;
    return excelData;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};
const fatchcustomer = async () => {
  try {
    const filePath = 'src/apis/cronwiseimport/Customers_Master.xls';

    const workbook = XLSX.readFile(filePath);
    const sheet_name_list = workbook.SheetNames;
    const jsonData = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]]
    );
    if (jsonData.length === 0) {
      throw new BadRequestError('File is empty');
    }
    const excelData = jsonData;
    return excelData;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};
const fatchemployee = async () => {
  try {
    const filePath =
      'src/apis/cronwiseimport/Csrc/apis/cronwiseimport/MIL_EMPLOYEE_MASTER.xls';

    const workbook = XLSX.readFile(filePath);
    const sheet_name_list = workbook.SheetNames;
    const jsonData = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]]
    );
    if (jsonData.length === 0) {
      throw new BadRequestError('File is empty');
    }
    const excelData = jsonData;
    return excelData;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};
const fatchsalescustomer = async () => {
  try {
    const filePath = 'src/apis/cronwiseimport/All_India_Sales_Register.xlsx';

    const workbook = XLSX.readFile(filePath);
    const sheet_name_list = workbook.SheetNames;
    const jsonData = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]]
    );
    if (jsonData.length === 0) {
      throw new BadRequestError('File is empty');
    }
    const excelData = jsonData;
    return excelData;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

export {
  uploadXLSX,
  fatchexcel,
  fatchcustomer,
  fatchemployee,
  fatchsalescustomer,
};