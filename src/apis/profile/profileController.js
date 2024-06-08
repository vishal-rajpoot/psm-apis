import { sendSuccess } from '../../utils/responseHandler';
import { getProfileService, updateProfileFlagService } from './profileService';

const getProfile = async (req, res) => {
  const token = req.user;
  const data = await getProfileService(token);
  return sendSuccess(
    res,
    { profile: data[0] },
    'getting profile data successfully'
  );
};

const updateProfileFlag = async (req, res) => {
  const token = req.user;
  const { id } = req.params;
  const { flag } = req.body;
  const data = await updateProfileFlagService(token, id, flag);
  return sendSuccess(
    res,
    { profilesUpdated: data },
    'updating profile flag successfully'
  );
};

export { getProfile, updateProfileFlag };
