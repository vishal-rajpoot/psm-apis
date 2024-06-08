import * as db from '../../utils/db';
import Logger from '../../utils/logger';

import {
  getDistributotByCodeDao,
  addSalesCollectiondao,
} from '../../dao/salesCollectionDao';

const logger = new Logger();

const uploadSalesColletionService = async (excelData, req) => {
  const { companyId } = req.user;
  const token = req.user;
  const usersToAdd = [];
  let gross_total;
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    for (const e of excelData) {
      const {
        fiscal_year,
        sales_org,
        ddst_channel,
        division,
        profit_center,
        billing_no,
        date,
        period,
        plant,
        code,
        party_name,
        city,
        state,
        region,
        country,
        group_code,
        group_name,
        distributor_code,
        material_description,
        quantity,
        uom,
        rate,
        curr,
        amount_in_dc,
        amount_in_inr,
        assasable_amount,
        cash_discount,
        sp_discount,
        cgst,
        sgst,
        igst,
        bed,
        ecs,
        h_ecs,
        cst,
        vat,
        add_vat,
        freight,
        trade_discount,
        gross,
        transporter,
        lr_no,
        batch,
        mfgdate,
        expdate,
        price_type,
        gstin,
        sales_officer,
        mktg_2,
        area_manager,
        zonal_manager,
        vat_no,
        cst_no,
        price_list,
        sales_order,
        so_Itm,
        deliver_no,
      } = e;
      const distributor = await getDistributotByCodeDao(conn, companyId, code);
      if (distributor !== undefined) {
        gross_total = Math.abs(amount_in_inr) - Math.abs(cash_discount);
        gross_total -= Math.abs(sp_discount);
        gross_total = gross_total + Math.abs(cgst) + Math.abs(sgst);
        gross_total -= Math.abs(freight);

        const user_object = {
          event_type: 'sales_collection',
          config: {
            distributor_id: distributor.id,
            fiscal_year,
            sales_org,
            ddst_channel,
            division,
            profit_center,
            billing_no,
            date,
            period,
            plant,
            code,
            party_name,
            city,
            state,
            region,
            country,
            group_code,
            group_name,
            distributor_code,
            material_description,
            quantity,
            uom,
            rate,
            curr,
            amount_in_dc,
            amount_in_inr,
            assasable_amount,
            cash_discount,
            sp_discount,
            cgst,
            sgst,
            igst,
            bed,
            ecs,
            h_ecs,
            cst,
            vat,
            add_vat,
            freight,
            trade_discount,
            gross,
            transporter,
            lr_no,
            batch,
            mfgdate,
            expdate,
            price_type,
            gstin,
            sales_officer,
            mktg_2,
            area_manager,
            zonal_manager,
            vat_no,
            cst_no,
            price_list,
            sales_order,
            so_Itm,
            deliver_no,
          },
        };
        usersToAdd.push(user_object);
      }
    }
    const added_users = [];
    for (const user of usersToAdd) {
      const add_user = await addSalesCollectiondao(conn, token, user);
      added_users.push(add_user);
    }
    return added_users;
  } catch (error) {
    logger.log('error uploading product, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};
const uploadCustomerSalesColletionService = async (excelData, req) => {
  const { companyId } = req.user;

  const token = req.user;
  const usersToAdd = [];
  let conn;
  try {
    conn = await db.fetchConn();
    await conn.beginTransaction();
    for (const e of excelData) {
      const {
        sales_officer,
        area_manager,
        zonal_manager,
        code,
        customer_name,
        profit_center,
        segment,
        mil_custcode,
        april,
        may,
        june,
        july,
        august,
        september,
        october,
        november,
        december,
        january,
        february,
        march,
        total,
      } = e;

      const distributor = await getDistributotByCodeDao(conn, companyId, code);

      if (distributor !== undefined) {
        const user_object = {
          event_type: 'customer_sales_collection',
          config: {
            sales_officer,
            area_manager,
            zonal_manager,
            code,
            customer_name,
            profit_center,
            segment,
            mil_custcode,
            april,
            may,
            june,
            july,
            august,
            september,
            october,
            november,
            december,
            january,
            february,
            march,
            total,
          },
        };
        usersToAdd.push(user_object);
      }
    }

    const added_users = [];
    for (const user of usersToAdd) {
      const add_user = await addSalesCollectiondao(conn, token, user);
      added_users.push(add_user);
    }
    return added_users;
  } catch (error) {
    logger.log('error uploading product, reverting changes', 'error', error);
    await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.end();
  }
};

export { uploadCustomerSalesColletionService, uploadSalesColletionService };
