import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { refineInpatientData } from "@/lib/refineStats";
import { refineOutpatientData } from "@/lib/refineStats";
import { refineInSalesData } from "@/lib/refineStats";
import { refineOutSalesData } from "@/lib/refineStats";

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
  providedDate.setDate(providedDate.getDate() - 14);
  const startDate = providedDate.toISOString().slice(0, 10).replace(/-/g, "");

  try {
    const pool = await getDbPool();

    // 첫 번째 쿼리: SILVER_PATIENT_INFO 데이터 처리
    // const inPatientQuery = `
    //   SELECT *
    //   FROM SILVER_PATIENT_INFO
    //   WHERE INDAT <= @date AND (OUTDAT >= @startDate OR OUTDAT = '        ');
    //   `;

    const inPatientQuery = `
      SELECT 
          s.*,
          w.cham_memo2 AS FUNNEL
      FROM SILVER_PATIENT_INFO s
      LEFT JOIN Wcham w
        ON s.CHARTNO = w.cham_key
      WHERE s.INDAT <= @date 
        AND (s.OUTDAT >= @startDate OR s.OUTDAT = '        ');
    `;

    const inPatientResult = await pool
      .request()
      .input("startDate", startDate)
      .input("date", date)
      .query(inPatientQuery);

    const inPatientData = inPatientResult.recordset;

    const inPatientStats = refineInpatientData(inPatientData, startDate, date);

    const outPatientQuery = `
      SELECT *
      FROM VIEWJUBLIST
      WHERE jubDate BETWEEN @startDate AND @date 
        AND jubInDate = '        ';
    `;

    const outPatientResult = await pool
      .request()
      .input("startDate", startDate)
      .input("date", date)
      .query(outPatientQuery);

    const outPatientData = outPatientResult.recordset;

    const outPatientStats = refineOutpatientData(outPatientData);

    const inSalesQuery = `
      SELECT isum_date, isum_su_amt
      FROM Wisum
      WHERE isum_date BETWEEN @startDate AND @date;
      `;

    const inSalesResult = await pool
      .request()
      .input("startDate", startDate)
      .input("date", date)
      .query(inSalesQuery);

    const inSalesData = inSalesResult.recordset;

    const inSalesStats = refineInSalesData(inSalesData);

    const outSalesQuery = `
      SELECT osum_date, osum_jin_date, osum_suamt, osum_user, osum_delete
      FROM Wosum
      WHERE osum_date BETWEEN @startDate AND @date;
      `;

    const outSalesResult = await pool
      .request()
      .input("startDate", startDate)
      .input("date", date)
      .query(outSalesQuery);

    const outSalesData = outSalesResult.recordset;
      
    const outSalesStats = refineOutSalesData(outSalesData);

    // 최종 통계 데이터 통합
    const stats = {
      inPatientStats,
      outPatientStats,
      inSalesStats,
      outSalesStats,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching patient data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
