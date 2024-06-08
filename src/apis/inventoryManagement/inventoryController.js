import { sendSuccess } from '../../utils/responseHandler';
import {
  deleteInventoryService,
  getInventoryByIdService,
  getInventoryService,
} from './inventoryService';

const getInventory = async (req, res) => {
  const { companyId } = req.user;
  const data = await getInventoryService(companyId);
  return sendSuccess(
    res,
    { inventory: data },
    'getting Inventory data successfully'
  );
};

const getInventoryById = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const data = await getInventoryByIdService(companyId, id);
  return sendSuccess(
    res,
    { inventory: data },
    'getting Inventory data by id successfully'
  );
};

const deleteInventory = async (req, res) => {
  const { companyId } = req.user;
  const { id } = req.params;
  const data = await deleteInventoryService(companyId, id);
  return sendSuccess(
    res,
    { inventory: data },
    'deleting Inventory data successfully'
  );
};

export { getInventory, getInventoryById, deleteInventory };
