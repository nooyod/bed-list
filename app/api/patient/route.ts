// import { NextResponse } from "next/server";
// import { getDbPool } from "@/lib/db";

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const date = searchParams.get("date");

//   if (!date) {
//     return NextResponse.json({ error: "Date is required" }, { status: 400 });
//   }

//   try {
//     const pool = await getDbPool();
//     const query = `
//       SELECT 
//         (SELECT COUNT(*) FROM SILVER_PATIENT_INFO WHERE INDAT <= @date AND (OUTDAT > @date OR OUTDAT = '        ')) AS totalinpatient,
//         (SELECT COUNT(*) FROM SILVER_PATIENT_INFO WHERE OUTKIND = '99' AND INDAT = @date) AS todayadm,
//         (SELECT COUNT(*) FROM SILVER_PATIENT_INFO WHERE OUTDAT = @date) AS todaydc,
//         SUM(CASE WHEN INSUCLS = '00' THEN 1 ELSE 0 END) AS insurance0,
//         SUM(CASE WHEN INSUCLS = '10' THEN 1 ELSE 0 END) AS insurance1,
//         SUM(CASE WHEN INSUCLS = '20' THEN 1 ELSE 0 END) AS insurance2,
//         SUM(CASE WHEN INSUCLS = '30' THEN 1 ELSE 0 END) AS insurance3,
//         SUM(CASE WHEN INSUCLS = '50' THEN 1 ELSE 0 END) AS insurance5
//         FROM SILVER_PATIENT_INFO
//         WHERE INDAT <= @date AND (OUTDAT > @date OR OUTDAT = '        ');
//     `;

//     const result = await pool.request().input("date", date).query(query);

//     const stats = result.recordset[0];

//     return NextResponse.json(stats);
//   } catch (error) {
//     console.error("Error fetching patient data:", error);
//     return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { refineJubData } from "@/lib/refineStats";
import { refineInpatientData } from "@/lib/refineStats";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  // Create a new Date object based on the provided date (assumes yyyymmdd format)
  const providedDate = new Date(
    parseInt(date.slice(0, 4)),       // Year
    parseInt(date.slice(4, 6)) - 1,  // Month (0-based index)
    parseInt(date.slice(6, 8))       // Day
  );
  providedDate.setDate(providedDate.getDate() - 19);
  const startDate = providedDate.toISOString().slice(0, 10).replace(/-/g, "");

  try {
    const pool = await getDbPool();

    // 첫 번째 쿼리: SILVER_PATIENT_INFO 데이터 처리
    const silverPatientQuery = `
      SELECT 
        (SELECT COUNT(*) FROM SILVER_PATIENT_INFO WHERE INDAT <= @date AND (OUTDAT > @date OR OUTDAT = '        ')) AS totalinpatient,
        (SELECT COUNT(*) FROM SILVER_PATIENT_INFO WHERE OUTKIND = '99' AND INDAT = @date) AS todayadm,
        (SELECT COUNT(*) FROM SILVER_PATIENT_INFO WHERE OUTDAT = @date) AS todaydc,
        SUM(CASE WHEN INSUCLS = '00' THEN 1 ELSE 0 END) AS insurance0,
        SUM(CASE WHEN INSUCLS = '10' THEN 1 ELSE 0 END) AS insurance1,
        SUM(CASE WHEN INSUCLS = '20' THEN 1 ELSE 0 END) AS insurance2,
        SUM(CASE WHEN INSUCLS = '30' THEN 1 ELSE 0 END) AS insurance3,
        SUM(CASE WHEN INSUCLS = '50' THEN 1 ELSE 0 END) AS insurance5
        FROM SILVER_PATIENT_INFO
        WHERE INDAT <= @date AND (OUTDAT > @date OR OUTDAT = '        ');
    `;

    const silverPatientResult = await pool
      .request()
      .input("date", date)
      .query(silverPatientQuery);

    const silverStats = silverPatientResult.recordset[0];

    const inPatientQuery = `
      SELECT *
      FROM SILVER_PATIENT_INFO
      WHERE INDAT <= @date AND (OUTDAT >= @startDate OR OUTDAT = '        ');
      `;

    const inPatientResult = await pool
      .request()
      .input("startDate", startDate)
      .input("date", date)
      .query(inPatientQuery);

    const inPatientData = inPatientResult.recordset;

    const inPatientStats = refineInpatientData(inPatientData, startDate, date);

    // 두 번째 쿼리: VIEWJUBLIST 데이터 처리
    const viewJubListQuery = `
      SELECT *
      FROM VIEWJUBLIST
      WHERE jubDate = @date AND jubInDate = '        ';
    `;

    const viewJubListResult = await pool
      .request()
      .input("date", date)
      .query(viewJubListQuery);

    const jubData = viewJubListResult.recordset;

    // 데이터 후처리
    const jubStats = refineJubData(jubData);

    // 최종 통계 데이터 통합
    const stats = {
      silverStats,
      jubStats,
      inPatientStats,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching patient data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
