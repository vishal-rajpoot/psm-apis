const getOrderDetailsDao = async (conn, token) => {
  const sql = ` SELECT COUNT(*) AS order_count,
  SUM(JSON_EXTRACT(config, '$.gross_total')) AS total_order_value
  FROM user_activities
  WHERE user = '${token.userId}'
  AND event_type = 'order'
  AND company = '${token.companyId}'
  AND DATE(created_at) = CURDATE()
  AND is_obsolate = false`;

  const meetingSql = `
  SELECT 
    IFNULL(COUNT(*), 0) AS meeting_count
  FROM 
    user_activities
  WHERE 
    user = '${token.userId}'
    AND company = '${token.companyId}'
    AND is_obsolate = false
    AND event_type IN (
      'meeting_distributor_meet', 'meeting_newparty_cosntact', 
      'organized_farmer_meeting', 'spot_farmer_meetting', 
      'individual_farmer_connect', 'demo_conducted', 
      'field_day', 'meeting_other'
    )
    AND DATE(created_at) = CURDATE();
`;
  const orderCount = await conn.query(sql);
  const meetingData = await conn.query(meetingSql);
  return { orderCount, meetingData };
};

export default {};
export { getOrderDetailsDao };
