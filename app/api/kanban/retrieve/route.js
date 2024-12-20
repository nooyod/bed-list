import fs from 'fs';
import path from 'path';
import sql from 'mssql';
import { getDbPool } from '@/lib/db';
import { NextResponse } from 'next/server';

const dataFilePath = path.join(process.cwd(), 'public', 'reserve.json');

// const dbConfig = {
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   server: process.env.DB_SERVER,
//   database: process.env.DB_DATABASE,
//   options: {
//     encrypt: false,
//     enableArithAbort: true,
//   },
// };

const readData = () => {
  if (!fs.existsSync(dataFilePath)) {
    return [];
  }
  const data = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(data);
};

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key'); // 요청에서 key 값을 가져옴
  
    if (!key) {
      return NextResponse.json({ success: false, message: 'Key is required' }, { status: 400 });
    }
  
    try {
      // 1. MSSQL 데이터 검색
      // await pool.connect(dbConfig);
      // const pool = await sql.connect(dbConfig);
      const pool = await getDbPool();
      const queryResult = await pool
        .request()
        .input('key', sql.VarChar, key)
        .query(`
          SELECT 
            ROOM AS chart_room, 
            CHARTNO AS chart_number, 
            PATNAME AS chart_name, 
            DOCT AS chart_doct, 
            INSUSUB AS chart_insurance, 
            INDAT AS chart_date_adm
          FROM SILVER_PATIENT_INFO
          WHERE CAST(CHARTNO AS VARCHAR) = @key
        `)
      if (queryResult.recordset.length > 0) {
        return NextResponse.json(queryResult.recordset[0]); // 데이터가 있으면 반환
      }
  
      // 2. reserve.json 데이터 검색
      const jsonData = await readData();
      const row = jsonData.find(
        (item) => String(item.index) === key || String(item.chart_number) === key
      );
      
      if (row) {
        return NextResponse.json(row); // reserve.json에서 데이터가 있으면 반환
      }
  
      return NextResponse.json({ success: false, message: 'Data not found' }, { status: 404 });
    } catch (error) {
      console.error('Error in RETRIEVE function:', error);
      return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    // } finally {
    //   pool.close();
    }
  }