import { ValidationError } from '../../utils/appErrors';
import { sendSuccess } from '../../utils/responseHandler';
import {
  addApprovalService,
  getApprovalService,
} from './featureApprovalService';
import { INSERT_FEATURE_APPROVAL_SCHEMA } from '../../schemas/featureApproval';

const getApproval = async (req, res) => {
  const { companyId } = req.user;
  const data = await getApprovalService(companyId);
  return sendSuccess(
    res,
    { approval: data },
    'getting approval data successfully'
  );
};

const addApproval = async (req, res) => {
  const { companyId } = req.user;
  const payload = req.body;
  const options = { abortEarly: false };
  const joiValidation = INSERT_FEATURE_APPROVAL_SCHEMA.validate(
    payload,
    options
  );
  if (joiValidation.error) {
    throw new ValidationError(joiValidation.error);
  }
  const data = await addApprovalService(payload, companyId);
  return sendSuccess(res, data, 'inserting approval data successfully');
};

export { getApproval, addApproval };
