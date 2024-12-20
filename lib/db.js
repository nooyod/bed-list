import sql from 'mssql';

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, // Azure에서 필요
    trustServerCertificate: true, // 로컬 테스트 시 필요
  },
};

let poolPromise;

export const getDbPool = async () => {
  if (!poolPromise) {
    poolPromise = sql.connect(dbConfig)
      .then((pool) => {
        console.log('Database connected');
        return pool;
      })
      .catch((err) => {
        console.error('Database connection failed:', err);
        poolPromise = null;
        throw err;
      });
  }
  return poolPromise;
};
