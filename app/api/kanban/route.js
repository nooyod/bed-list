import { NextResponse } from 'next/server';
// import { Board } from 'kanbanize';
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
        ROOM AS column_name,          -- 칸반 보드의 열 이름
        CHARTNO AS card_id,           -- 카드 ID
        PATNAME AS card_title,        -- 카드 제목
        DOCT AS doct,         -- 의사 정보
        INSUCLS AS insucls    -- 보험 정보
      FROM SILVER_PATIENT_INFO
      WHERE OUTKIND = '99'            -- outkind가 99인 행만 필터링
    `);

    const insusubMap = {
      '00': '건강보험',
      '10': '의료급여',
      '20': '자동차',
      '40': '산재',
    };

    // 데이터 변환: 열과 카드 매칭
    const kanbanData = predefinedColumns.reduce((board, columnName) => {
      // 각 열 이름에 대해 초기 빈 배열 설정
      board[columnName] = [];
      return board;
    }, {});

    // 받아온 데이터 추가
    result.recordset.forEach((row) => {
      const insusubDisplay = insusubMap[row.insucls] || 'unknown'; // 매핑되지 않은 값은 'unknown'
      const card = {
        id: row.card_id,
        title: row.card_title,
        description: `${row.doct} (${insusubDisplay})`, // 카드 설명
      };
      // 열에 카드 추가
      if (kanbanData[row.column_name]) {
        kanbanData[row.column_name].push(card);
      }
    });

    const filePath = path.join(process.cwd(), 'public', 'reserve.json'); // JSON 파일 경로
    const fileContent = await readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    // JSON 데이터 추가
    jsonData.forEach((row, any) => {
      const insusubDisplay = insusubMap[row.insucls] || 'unknown'; // 매핑되지 않은 값은 'unknown'
      const card = {
        id: row.card_id,
        title: row.card_title,
        description: `${row.doct} (${insusubDisplay})`, // 카드 설명
      };
      if (kanbanData[row.column_name]) {
        kanbanData[row.column_name].push(card);
      }
    });


    return NextResponse.json(kanbanData);
  } catch (error) {
    console.error('Error fetching Kanban data:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
//     // 가져온 데이터를 Kanban 보드 형식으로 변환
//     const kanbanData = result.recordset.reduce((board, row) => {
//       const column = row.column_name; // 열 이름
//       const insusubDisplay = insusubMap[row.insucls] || 'unknown'; // 매핑되지 않은 값은 'unknown'
//       const card = {
//         id: row.card_id,            // 카드 ID
//         title: row.card_title,      // 카드 제목
//         description: `${row.doct} (${insusubDisplay})`, // 카드 설명
//       };

//       // 열이 없으면 초기화
//       if (!board[column]) {
//         board[column] = [];
//       }

//       // 카드 추가
//       board[column].push(card);

//       return board;
//     }, {});

//     // 열(column)을 오름차순으로 정렬
//     const sortedColumns = Object.keys(kanbanData).sort(); // column_name을 오름차순 정렬

//     // 정렬된 열에 맞게 데이터 재구성
//     const sortedKanbanData = sortedColumns.reduce((sortedBoard, column) => {
//       sortedBoard[column] = kanbanData[column];
//       return sortedBoard;
//     }, {});

//     return NextResponse.json(sortedKanbanData);
//   } catch (error) {
//     console.error('Error fetching Kanban data:', error);
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// }