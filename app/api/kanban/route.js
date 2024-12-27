// import { NextResponse } from 'next/server';
// import sql from 'mssql';
// import { readFile } from 'fs/promises';
// import path from 'path';

// // MSSQL 데이터베이스 연결 설정
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

// // 미리 정의된 열 목록
// const predefinedColumns = ['201호', '202호', '203호', '205호', '206호', '207호', '208호', '209호', '210호', '대기'];

// export async function GET() {
//   try {
//     // MSSQL 연결
//     const pool = await sql.connect(dbConfig);

//     // 뷰에서 데이터 가져오기
//     const result = await pool.request().query(`
//       SELECT 
//         ROOM AS chart_room,          -- 칸반 보드의 열 이름
//         CHARTNO AS chart_number,           -- 카드 ID
//         PATNAME AS chart_name,        -- 카드 제목
//         DOCT AS chart_doct,         -- 의사 정보
//         INSUSUB AS chart_insurance,    -- 보험 정보
//         INDAT AS chart_date_adm,     -- 입원 날짜
//         JUMIN AS chart_rrn         -- 주민등록번호
//       FROM SILVER_PATIENT_INFO
//       WHERE OUTKIND = '99'            -- outkind가 99인 행만 필터링
//     `);

//     const insusubMap = {
//       '010': '건강보험',
//       '110': '의료급여',
//       '210': '자동차',
//       '410': '산재',
//     };

//     const doctorMap = {
//       '류익현': '1과',
//       '이지수': '2과',
//       '김정섭': '재활',
//       '정가현': '침구',
//       '이방원': '통증',
//     };

//     // 데이터 변환: 열과 카드 매칭
//     const kanbanData = predefinedColumns.reduce((board, columnName) => {
//       // 각 열 이름에 대해 초기 빈 배열 설정
//       board[columnName] = [];
//       return board;
//     }, {});

//     // 받아온 데이터 추가
//     result.recordset.forEach((row) => {
//       const insusubDisplay = insusubMap[row.chart_insurance] || 'unknown'; // 매핑되지 않은 값은 'unknown'
//       const doctDisplay = doctorMap[row.chart_doct] || 'unknown'; // 매핑되지 않은 값은 'unknown'
//       const card = {
//         id: row.chart_number,
//         row1: `${row.chart_number.slice(-5)} ${row.chart_name}`, // 뒤의 5자리만 보여줌
//         row2: row.chart_date_adm,
//         row2: `${row.chart_date_adm.slice(0, 4)}-${row.chart_date_adm.slice(4, 6)}-${row.chart_date_adm.slice(6, 8)}`,
//         row3: `${doctDisplay} (${insusubDisplay})`, // 카드 설명
//       };
//       // 열에 카드 추가
//       if (kanbanData[row.chart_room]) {
//         kanbanData[row.chart_room].push(card);
//       }
//     });

//     const filePath = path.join(process.cwd(), 'public', 'reserve.json'); // JSON 파일 경로
//     const fileContent = await readFile(filePath, 'utf-8');
//     const jsonData = JSON.parse(fileContent);

//     // JSON 데이터 추가
//     jsonData.forEach((row, any) => {
//       const insusubDisplay = insusubMap[row.chart_insurance] || 'unknown'; // 매핑되지 않은 값은 'unknown'
//       const card = {
//         id: row.chart_number,
//         row1: row.chart_number,
//         row2: row.chart_date_adm,
//         row3: `${row.chart_doct} (${insusubDisplay})`, // 카드 설명
//       };
//       if (kanbanData[row.chart_room]) {
//         kanbanData[row.chart_room].push(card);
//       }
//     });

//     return NextResponse.json(kanbanData);
//   } catch (error) {
//     console.error('Error fetching Kanban data:', error);
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// }

// export async function DELETE(request) {
//   try {
//     const { id } = await request.json(); // 삭제할 카드의 ID를 클라이언트에서 받음

//     const filePath = path.join(process.cwd(), 'public', 'reserve.json');
//     const fileContent = await readFile(filePath, 'utf-8');
//     const jsonData = JSON.parse(fileContent);

//     // 데이터에서 해당 ID를 가진 카드 제거
//     const updatedData = jsonData.filter((card) => card.chart_number !== id);

//     // 수정된 데이터를 파일에 저장
//     await writeFile(filePath, JSON.stringify(updatedData, null, 2), 'utf-8');

//     return NextResponse.json({ success: true, message: 'Card deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting card:', error);
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// }

// import { NextResponse } from 'next/server';
// import sql from 'mssql';
// import { readFile, writeFile } from 'fs/promises';
// import path from 'path';

// // MSSQL 데이터베이스 연결 설정
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

// const predefinedColumns = ['201호', '202호', '203호', '205호', '206호', '207호', '208호', '209호', '210호', '대기'];

// // GET 핸들러: 칸반 데이터를 가져오기
// export async function GET() {
//   try {
//     const pool = await sql.connect(dbConfig);

//     const result = await pool.request().query(`
//       SELECT 
//         ROOM AS chart_room, 
//         CHARTNO AS chart_number, 
//         PATNAME AS chart_name, 
//         DOCT AS chart_doct, 
//         INSUSUB AS chart_insurance, 
//         INDAT AS chart_date_adm
//       FROM SILVER_PATIENT_INFO
//       WHERE OUTKIND = '99'
//     `);

//     const insusubMap = {
//       '010': '건강보험',
//       '110': '의료급여',
//       '210': '자동차',
//       '410': '산재',
//     };

//     const doctorMap = {
//       '류익현': '1과',
//       '이지수': '2과',
//       '김정섭': '재활',
//       '정가현': '침구',
//       '이방원': '통증',
//     };

//     const kanbanData = predefinedColumns.reduce((board, columnName) => {
//       board[columnName] = [];
//       return board;
//     }, {});

//     result.recordset.forEach((row) => {
//       const card = {
//         id: row.chart_number,
//         row1: `${row.chart_number.slice(-5)} ${row.chart_name}`,
//         row2: `${row.chart_date_adm.slice(0, 4)}-${row.chart_date_adm.slice(4, 6)}-${row.chart_date_adm.slice(6, 8)}`,
//         row3: `${doctorMap[row.chart_doct] || 'unknown'} (${insusubMap[row.chart_insurance] || 'unknown'})`,
//       };
//       if (kanbanData[row.chart_room]) {
//         kanbanData[row.chart_room].push(card);
//       }
//     });

//     const filePath = path.join(process.cwd(), 'public', 'reserve.json');
//     const fileContent = await readFile(filePath, 'utf-8');
//     const jsonData = JSON.parse(fileContent);

//     jsonData.forEach((row) => {
//       const card = {
//         id: row.chart_number,
//         row1: row.chart_number,
//         row2: row.chart_date_adm,
//         row3: `${row.chart_doct} (${insusubMap[row.chart_insurance] || 'unknown'})`,
//       };
//       if (kanbanData[row.chart_room]) {
//         kanbanData[row.chart_room].push(card);
//       }
//     });

//     return NextResponse.json(kanbanData);
//   } catch (error) {
//     console.error('Error fetching Kanban data:', error);
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// }

// // POST 핸들러: 새 카드 추가
// export async function POST(request) {
//   try {
//     const newCard = await request.json();

//     const filePath = path.join(process.cwd(), 'public', 'reserve.json');
//     const fileContent = await readFile(filePath, 'utf-8');
//     const jsonData = JSON.parse(fileContent);

//     jsonData.push(newCard);

//     await writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');

//     return NextResponse.json({ success: true, data: newCard });
//   } catch (error) {
//     console.error('Error adding new card:', error);
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// }

// // DELETE 핸들러: 카드 삭제
// export async function DELETE(request) {
//   try {
//     const { id } = await request.json();

//     const filePath = path.join(process.cwd(), 'public', 'reserve.json');
//     const fileContent = await readFile(filePath, 'utf-8');
//     const jsonData = JSON.parse(fileContent);

//     const updatedData = jsonData.filter((card) => card.chart_number !== id);

//     await writeFile(filePath, JSON.stringify(updatedData, null, 2), 'utf-8');

//     return NextResponse.json({ success: true, message: 'Card deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting card:', error);
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// }


import fs from 'fs';
import path from 'path';
import sql from 'mssql';
import { getDbPool } from '@/lib/db';
import { NextResponse } from 'next/server';
import { syncCurrentData } from '@/lib/syncData';

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

const predefinedColumns = ['201호', '202호', '203호', '205호', '206호', '207호', '208호', '209호', '210호', '대기'];

const readData = () => {
  if (!fs.existsSync(dataFilePath)) {
    return [];
  }
  const data = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(data);
};

const writeData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
};

export async function GET() {
  try {
    // const pool = await sql.connect(dbConfig);
    // const pool = await getDbPool();
    // const result = await pool.request().query(`
    //   SELECT 
    //     ROOM AS chart_room, 
    //     CHARTNO AS chart_number, 
    //     PATNAME AS chart_name, 
    //     DOCT AS chart_doct, 
    //     INSUSUB AS chart_insurance, 
    //     INDAT AS chart_date_adm
    //   FROM SILVER_PATIENT_INFO
    //   WHERE OUTKIND = '99'
    // `);

    const insusubMap = {
      '010': '건강보험',
      '110': '의료급여',
      '210': '자동차',
      '390': '산재',
      "040": '차상위1',
      "290": '자보100'
    };

    const doctorMap = {
      '류익현': '1과',
      '이지수': '2과',
      '김정섭': '재활',
      '정가현': '침구',
      '이방원': '통증',
    };

    const kanbanData = predefinedColumns.reduce((board, columnName) => {
      board[columnName] = [];
      return board;
    }, {});

    const result = await syncCurrentData();
    result.forEach((row) => {
      const card = {
        id: row.chart_number,
        row1: `${row.chart_number.slice(-5)} ${row.chart_name}`,
        row2: `${row.chart_date_adm.slice(0, 4)}-${row.chart_date_adm.slice(4, 6)}-${row.chart_date_adm.slice(6, 8)}`,
        row3: `${doctorMap[row.chart_doct] || 'unknown'} (${insusubMap[row.chart_insurance] || 'unknown'})`,
      };
      if (kanbanData[row.chart_room]) {
        kanbanData[row.chart_room].push(card);
      }
    });

    const fileContent = readData();

    fileContent.forEach((row) => {
      const card = {
        id: row.index,
        row1: row.chart_name,
        row2: `${row.chart_date_adm.slice(0, 4)}-${row.chart_date_adm.slice(4, 6)}-${row.chart_date_adm.slice(6, 8)}`,
        row3: `${row.chart_funnel} (${row.chart_insurance})`,
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

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const data = readData();

//     const newEntry = {
//       index: data.length + 1,
//       chart_name: body.chart_name,
//       chart_gender: body.chart_gender,
//       chart_date_adm: body.chart_date_adm,
//       chart_insurance: body.chart_insurance,
//       chart_funnel: body.chart_funnel,
//       chart_room: body.chart_room,
//     };

//     data.push(newEntry);
//     writeData(data);

//     return NextResponse.json(newEntry, { status: 201 });
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
//   }
// }

// export async function DELETE(request) {
//   try {
//     const body = await request.json();
//     const data = readData();

//     const updatedData = data
//       .filter((entry) => String(entry.index) !== String(body.key))// && String(entry.chart_number) !== String(body.key)) // key로 비교
//       .map((entry, idx) => ({ ...entry, index: idx + 1 })); // 인덱스 재배열

//     writeData(updatedData);

//     return NextResponse.json({ success: true }, { status: 200 });
//   } catch (error) {
//     console.error('Error in DELETE function:', error);
//     return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
//   }
// }
