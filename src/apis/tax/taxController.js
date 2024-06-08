import { ValidationError } from '../../utils/appErrors';
import { sendSuccess } from '../../utils/responseHandler';
import { getTaxService, updateTaxService } from './taxService';
import UPDATE_TAX_SCHEMA from '../../schemas/taxSchema';

const getTax = async (req, res) => {
  const { companyId, userId } = req.user;
  const data = await getTaxService(companyId, userId);
  return sendSuccess(res, data, 'getting tax setting');
};

const updateTax = async (req, res) => {
  const { companyId } = req.user;
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = UPDATE_TAX_SCHEMA.validate(payload, options);
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await updateTaxService(companyId, payload);
  return sendSuccess(res, data, 'tax setting updated');
};

export { getTax, updateTax };
