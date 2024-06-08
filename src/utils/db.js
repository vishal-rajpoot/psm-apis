import mariadb from 'mariadb';
import appConfig from '../config/appconfig';

let connPool;
const initializeDbConnection = () => {
  connPool = mariadb.createPool({
    host: appConfig.db.host,
    port: appConfig.db.port,
    user: appConfig.db.username,
    password: appConfig.db.password,
    connectionLimit: appConfig.db.connPoolLimit,
    database: appConfig.db.database,
  });
};

// Fetch Connection
const fetchConn = async () => {
  const conn = await connPool.getConnection();
  return conn;
};

export { initializeDbConnection, fetchConn };
