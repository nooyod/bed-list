import { NextResponse } from 'next/server';
import sql from 'mssql';
import { readFile } from 'fs/promises';
import path from 'path';

// MSSQL 데이터베이스 연결 설정
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    enableArithAbort: true,
  },
};

// 미리 정의된 열 목록
const predefinedColumns = ['201호', '202호', '203호', '205호', '206호', '207호', '208호', '209호', '210호', '대기'];

export async function GET() {
  try {
    // MSSQL 연결
    const pool = await sql.connect(dbConfig);

    // 뷰에서 데이터 가져오기
    const result = await pool.request().query(`
      SELECT 
        ROOM AS chart_room,          -- 칸반 보드의 열 이름
        CHARTNO AS chart_number,           -- 카드 ID
        PATNAME AS chart_name,        -- 카드 제목
        DOCT AS chart_doct,         -- 의사 정보
        INSUSUB AS chart_insurance,    -- 보험 정보
        INDAT AS chart_date_adm,     -- 입원 날짜
        OUTDAT AS chart_date_dc,     -- 퇴원 날짜
        JUMIN AS chart_rrn         -- 주민등록번호
      FROM SILVER_PATIENT_INFO
      WHERE OUTKIND = '99'            -- outkind가 99인 행만 필터링
    `);

    const insusubMap = {
      '010': '건강보험',
      '110': '의료급여',
      '210': '자동차',
      '410': '산재',
    };

    // 데이터 변환: 열과 카드 매칭
    const kanbanData = predefinedColumns.reduce((board, columnName) => {
      // 각 열 이름에 대해 초기 빈 배열 설정
      board[columnName] = [];
      return board;
    }, {});

    // 받아온 데이터 추가
    result.recordset.forEach((row) => {
      const insusubDisplay = insusubMap[row.chart_insurance] || 'unknown'; // 매핑되지 않은 값은 'unknown'
      const card = {
        id: row.chart_number,
        title: row.chart_name,
        description: `${row.chart_doct} (${insusubDisplay})`, // 카드 설명
      };
      // 열에 카드 추가
      if (kanbanData[row.chart_room]) {
        kanbanData[row.chart_room].push(card);
      }
    });

    const filePath = path.join(process.cwd(), 'public', 'reserve.json'); // JSON 파일 경로
    const fileContent = await readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    // JSON 데이터 추가
    jsonData.forEach((row, any) => {
      const insusubDisplay = insusubMap[row.chart_insurance] || 'unknown'; // 매핑되지 않은 값은 'unknown'
      const card = {
        id: row.chart_number,
        title: row.chart_name,
        description: `${row.chart_doct} (${insusubDisplay})`, // 카드 설명
      };
      if (kanbanData[row.chart_room]) {
        kanbanData[row.chart_room].push(card);
      }
    });

    return NextResponse.json(kanbanData);
  } catch (error) {
    console.error('Error fetching Kanban data:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json(); // 삭제할 카드의 ID를 클라이언트에서 받음

    const filePath = path.join(process.cwd(), 'public', 'reserve.json');
    const fileContent = await readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    // 데이터에서 해당 ID를 가진 카드 제거
    const updatedData = jsonData.filter((card) => card.chart_number !== id);

    // 수정된 데이터를 파일에 저장
    await writeFile(filePath, JSON.stringify(updatedData, null, 2), 'utf-8');

    return NextResponse.json({ success: true, message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
