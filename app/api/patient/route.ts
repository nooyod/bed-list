import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  try {
    const pool = await getDbPool();
    const query = `
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

    const result = await pool.request().input("date", date).query(query);

    const stats = result.recordset[0];

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching patient data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
