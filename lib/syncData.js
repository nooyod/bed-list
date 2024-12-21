import { promises as fs } from 'fs';
import path from 'path';
import { getDbPool } from '@/lib/db';

// current.json 파일 경로
const CURRENT_JSON_PATH = path.join(process.cwd(), 'public', 'current.json');

// MSSQL에서 데이터를 가져와 current.json과 동기화하는 함수
export const syncCurrentData = async () => {
  const pool = await getDbPool();
  const mssqlQuery = `
    SELECT
      ROOM AS chart_room,
      CHARTNO AS chart_number,
      PATNAME AS chart_name,
      DOCT AS chart_doct,
      INSUSUB AS chart_insurance,
      INDAT AS chart_date_adm,
      OUTKIND AS chart_status
    FROM SILVER_PATIENT_INFO
    WHERE OUTKIND = '99'
  `;

  try {
    // MSSQL 데이터 가져오기
    const mssqlResult = await pool.request().query(mssqlQuery);
    const mssqlData = mssqlResult.recordset;

    // current.json 데이터 읽기
    let currentData = [];
    try {
      const jsonData = await fs.readFile(CURRENT_JSON_PATH, 'utf-8');
      currentData = JSON.parse(jsonData);
    } catch (err) {
      console.warn('current.json not found, initializing as empty array.');
    }

    // MSSQL 데이터 기준으로 동기화
    const updatedData = [];

    // MSSQL 데이터와 current.json 동기화
    mssqlData.forEach((mssqlRow) => {
      const existingEntry = currentData.find(
        (entry) =>
          entry.chart_number === mssqlRow.chart_number &&
          entry.chart_date_adm === mssqlRow.chart_date_adm
      );

      if (existingEntry) {
        // 기존 데이터 업데이트
        updatedData.push({ ...existingEntry, ...mssqlRow });
      } else {
        // MSSQL에는 있고 current.json에 없으면 추가
        updatedData.push({ ...mssqlRow });
      }
    });

    // current.json에 있지만 MSSQL에 없는 데이터 제거
    const mssqlKeys = mssqlData.map(
      (row) => `${row.chart_number}_${row.chart_date_adm}`
    );
    const filteredData = updatedData.filter((entry) =>
      mssqlKeys.includes(`${entry.chart_number}_${entry.chart_date_adm}`)
    );

    // current.json에 동기화된 데이터 저장
    await fs.writeFile(CURRENT_JSON_PATH, JSON.stringify(filteredData, null, 2));
    console.log('current.json successfully synchronized with MSSQL data.');
    return filteredData;
  } catch (err) {
    console.error('Error synchronizing data:', err);
    throw err;
  }
};
