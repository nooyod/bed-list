import { NextResponse } from 'next/server';
import { Board } from 'kanbanize';
import sql from 'mssql';

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

export async function GET() {
  try {
    // MSSQL 연결
    const pool = await sql.connect(dbConfig);

    // 뷰에서 데이터 가져오기
    const result = await pool.request().query(`
      SELECT 
        ROOM AS column_name,          -- 칸반 보드의 열 이름
        CHARTNO AS card_id,           -- 카드 ID
        PATNAME AS card_title,        -- 카드 제목
        DOCT + ' (' + INSUSUB + ')' AS card_description -- 카드 설명
      FROM SILVER_PATIENT_INFO
      WHERE OUTKIND = '99'            -- outkind가 99인 행만 필터링
    `);

    // 가져온 데이터를 Kanban 보드 형식으로 변환
    const kanbanData = result.recordset.reduce((board, row) => {
      const column = row.column_name; // 열 이름
      const card = {
        id: row.card_id,            // 카드 ID
        title: row.card_title,      // 카드 제목
        description: row.card_description, // 카드 설명
      };

      // 열이 없으면 초기화
      if (!board[column]) {
        board[column] = [];
      }

      // 카드 추가
      board[column].push(card);

      return board;
    }, {});

    return NextResponse.json(kanbanData);
  } catch (error) {
    console.error('Error fetching Kanban data:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Kanban 보드 초기화
const kanbanBoard = new Board({
  columns: ['201호', '202호', '203호', '205호', '206호', '207호', '208호', '209호', '201호', '대기'], // 기본 열
});

// // 기본 카드 추가
// kanbanBoard.addCard('대기', { id: 1, title: 'Task 1', description: 'First task' });
// kanbanBoard.addCard('대기', { id: 2, title: 'Task 2', description: 'Second task' });

// // GET 요청: 보드 데이터 가져오기
// export async function GET() {
//   return NextResponse.json(kanbanBoard.toJSON());
// }

// // POST 요청: 새 카드 추가
// export async function POST(request) {
//   const body = await request.json(); // 클라이언트에서 보낸 데이터
//   const { column, card } = body;

//   try {
//     kanbanBoard.addCard(column, card); // 지정된 열에 카드 추가
//     return NextResponse.json({ success: true, board: kanbanBoard.toJSON() });
//   } catch (error) {
//     return NextResponse.json({ success: false, message: error.message }, { status: 400 });
//   }
// }
