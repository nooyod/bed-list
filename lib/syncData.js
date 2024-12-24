import { promises as fs } from 'fs';
import path from 'path';
import { getDbPool } from '@/lib/db';

// current.json 파일 경로
const CURRENT_JSON_PATH = path.join(process.cwd(), 'public', 'current.json');

// 현재 날짜 가져오기
const getCurrentYear = () => new Date().getFullYear();

// 주민등록번호로 성별, 생년월일, 나이 계산
const processJuminData = (chart_jumin) => {
  if (!chart_jumin || chart_jumin.length < 7) {
    return { chart_gender: '', chart_birth: '', chart_age: '' };
  }

  const genderCode = parseInt(chart_jumin[6], 10); // 7번째 자리
  const chart_gender = genderCode % 2 === 0 ? '여자' : '남자';

  const birthYearPrefix = genderCode <= 2 ? 1900 : 2000;
  const birthYear = birthYearPrefix + parseInt(chart_jumin.slice(0, 2), 10);
  const birthMonthDay = chart_jumin.slice(2, 6);
  const chart_birth = `${birthYear}${birthMonthDay}`;

  const currentYear = getCurrentYear();
  const chart_age = currentYear - birthYear;

  return { chart_gender, chart_birth, chart_age };
};

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
      OUTKIND AS chart_status,
      JUMIN AS chart_jumin
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

      // 주민등록번호 기반 데이터 가공
      const { chart_gender, chart_birth, chart_age } = processJuminData(mssqlRow.chart_jumin);

      // 새로운 데이터 생성
      const newData = {
        ...mssqlRow,
        chart_gender,
        chart_birth,
        chart_age,
        chart_date_dc: '', // 추가 속성
        chart_doct2: '', // 추가 속성
        chart_memo: '', // 추가 속성
      };

      if (existingEntry) {
        // 기존 데이터 업데이트
        updatedData.push({ ...existingEntry, ...newData, 
          chart_memo: existingEntry.chart_memo || '',
          chart_doct2: existingEntry.chart_doct2 || '',
          chart_date_dc: existingEntry.chart_date_dc || '',
        });
      } else {
        // MSSQL에는 있고 current.json에 없으면 추가
        updatedData.push({ ...newData });
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
