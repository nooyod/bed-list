import { promises as fs } from 'fs';
import path from 'path';
import { getDbPool } from '@/lib/db';
import { doctorMap } from '@/lib/config';


// current.json 파일 경로
const CURRENT_JSON_PATH = path.join(process.cwd(), 'data', 'current.json');

// 현재 날짜 가져오기
const getCurrentDate = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate()); // 시간 정보 제거
};

// 날짜 차이를 계산하는 함수 (일수)
const calculateStayDays = (chart_date_adm) => {
  if (!chart_date_adm || chart_date_adm.length !== 8) return 0;

  // yyyymmdd를 Date 객체로 변환
  const year = parseInt(chart_date_adm.slice(0, 4), 10);
  const month = parseInt(chart_date_adm.slice(4, 6), 10) - 1; // 월은 0부터 시작
  const day = parseInt(chart_date_adm.slice(6, 8), 10);
  const admDate = new Date(year, month, day);

  // 현재 날짜와의 차이를 계산
  const currentDate = getCurrentDate();
  const diffTime = currentDate - admDate;

  // 일수로 변환
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24))); // 음수 방지를 위해 Math.max 사용
};

  // 나이 계산 함수
  const calculateAge = (chart_birth) => {
    if (!chart_birth || chart_birth.length !== 8) return '';

    const birthYear = parseInt(chart_birth.slice(0, 4), 10);
    const currentYear = getCurrentDate().getFullYear();
    return currentYear - birthYear;
  };

// MSSQL에서 데이터를 가져와 current.json과 동기화하는 함수
export const syncCurrentData = async () => {
  const pool = await getDbPool();
  const mssqlQuery = process.env.MSSQL_QUERY;

  try {
    // MSSQL 데이터 가져오기
    const mssqlResult = await pool.request().query(mssqlQuery);
    const mssqlData = mssqlResult.recordset;

    // Wcham 데이터 가져오기
    const wchamQuery = process.env.WCHAM_QUERY;
    const wchamResult = await pool.request().query(wchamQuery);
    const wchamData = wchamResult.recordset;

    // Wcham 데이터를 Map으로 변환하여 빠르게 조회 가능하게 만듦
    const wchamMap = new Map(
      wchamData.map((wchamRow) => [
        wchamRow.cham_key,
        {
          cham_memo2: wchamRow.cham_memo2,
          cham_birth: wchamRow.cham_birth,
          cham_sex: wchamRow.cham_sex,
        },
      ])
    );

    // Oidis 데이터 가져오기
    const oidisQuery = process.env.OIDIS_QUERY;
    const oidisResult = await pool.request().query(oidisQuery);
    const oidisData = oidisResult.recordset;

    // Wdism 데이터 가져오기
    const dismmQuery = process.env.DISMM_QUERY;
    const dismmResult = await pool.request().query(dismmQuery);
    const dismmData = dismmResult.recordset;

    // Osradpw 데이터 가져오기
    const osradQuery = process.env.OSRAD_QUERY;
    const osradResult = await pool.request().query(osradQuery);
    const osradData = osradResult.recordset;

    // 날짜 형식을 비교할 수 있도록 정렬용 함수
    const compareDate = (a, b) => a.localeCompare(b);

    // DismMapp 데이터를 Map으로 변환 (ndism_key => ndism_name)
    const dismmMap = new Map(
      dismmData.map((row) => [row.dism_key.trim(), row.dism_h_name])
    );

    // current.json 데이터 읽기
    let currentData = [];
    try {
      const jsonData = await fs.readFile(CURRENT_JSON_PATH, 'utf-8');
      currentData = JSON.parse(jsonData);
    } catch (err) {
      console.warn('current.json not found, initializing as empty array.', err);
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

      const chart_date_stay = calculateStayDays(mssqlRow.chart_date_adm);

      // Wcham 데이터 가져오기
      const wchamEntry = wchamMap.get(mssqlRow.chart_number) || {};
      const chart_funnel = wchamEntry.cham_memo2 || '';

      // chart_birth와 chart_gender 계산
      const chart_birth = wchamEntry.cham_birth || ''; // yyyymmdd 그대로 사용
      const chart_gender = wchamEntry.cham_sex === 1 ? '남자' : wchamEntry.cham_sex === 2 ? '여자' : '';

    // chart_dis_code 계산
    const matchedOidis = oidisData
      .filter(
        (oidis) =>
          oidis.idis_cham === mssqlRow.chart_number &&
          oidis.idis_in_date === mssqlRow.chart_date_adm
          // oidis.idis_gwam != 9 &&
          // oidis.idis_first === 1
      )
      .sort((a, b) => a.idis_date.localeCompare(b.idis_date));

    const chart_dis_code = matchedOidis[0]?.idis_dism.trim() || null;
    const chart_dis_name = chart_dis_code ? dismmMap.get(chart_dis_code) || '' : '';

    // ✅ chart_xray_count 및 chart_xray_last 계산
    const matchedOsrad = osradData
      .filter(
        (row) =>
          row.sradpw_cham === mssqlRow.chart_number &&
          row.sradpw_date >= mssqlRow.chart_date_adm
      )
      .map((row) => row.sradpw_date);

    // 중복 제거
    const uniqueDates = [...new Set(matchedOsrad)];

    const chart_xray_count = uniqueDates.length;
    const chart_xray_last = uniqueDates.length > 0
      ? uniqueDates.sort(compareDate).at(-1) // 가장 최신 날짜
      : '';

      // 새로운 데이터 생성
      const newData = {
        ...mssqlRow,
        chart_doct: doctorMap[mssqlRow.chart_doct] || mssqlRow.chart_doct, // doctorMap을 사용하여 매핑
        chart_gender,
        chart_birth,
        chart_age: calculateAge(chart_birth), // 나이 계산 함수 사용
        chart_date_stay,
        chart_funnel: chart_funnel.replace("/SMS거부","").replace("/sms거부","").trim(),
        chart_date_dc: '', // 추가 속성
        chart_check_dc: false, // 추가 속성
        chart_doct2: '', // 추가 속성
        chart_memo: '', // 추가 속성
        chart_dis_code, // 추가 속성
        chart_dis_name, // 추가 속성
        chart_xray_count, //추가 속성
        chart_xray_last, // 추가 속성
      };

      if (existingEntry) {
        // 기존 데이터 업데이트
        updatedData.push({ ...existingEntry, ...newData, 
          chart_memo: existingEntry.chart_memo || '',
          chart_doct2: existingEntry.chart_doct2 || '',
          chart_date_dc: existingEntry.chart_date_dc || '',
          chart_check_dc: existingEntry.chart_check_dc || false,
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
    // console.log('current.json successfully synchronized with MSSQL data.');
    return filteredData;
  } catch (err) {
    console.error('Error synchronizing data:', err);
    throw err;
  }
};
