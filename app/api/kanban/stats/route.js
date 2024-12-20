import fs from 'fs';
import path from 'path';
import sql from 'mssql';
import { getDbPool } from '@/lib/db';
import { NextResponse } from 'next/server';
// import { readData } from '@/db/fileOperations'; // reserve.json을 읽는 함수

const MAX_CAPACITY = {
    "201호": 3,
    "202호": 2,
    "203호": 6,
    "205호": 8,
    "206호": 8,
    "207호": 8,
    "208호": 4,
    "209호": 2,
    "210호": 2,
    "대기": 10,
  };

const dataFilePath = path.join(process.cwd(), 'public', 'reserve.json');

const readData = () => {
  if (!fs.existsSync(dataFilePath)) {
    return [];
  }
  const data = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(data);
};

// export async function GET() {
//   try {
//     const data = readData();

//     // chart_doct 별 개수 계산
//     const chartDoctCounts = data.reduce((acc, entry) => {
//       acc[entry.chart_doct] = (acc[entry.chart_doct] || 0) + 1;
//       return acc;
//     }, {});

//     // 컬럼별 카드 개수 계산
    // const columnCounts = data.reduce((acc, entry) => {
    //   acc[entry.column] = (acc[entry.column] || 0) + 1;
    //   return acc;
    // }, {});

//     return new Response(JSON.stringify({ chartDoctCounts, columnCounts }), {
//       headers: { 'Content-Type': 'application/json' },
//       status: 200,
//     });
//   } catch (error) {
//     console.error('Error fetching stats:', error);
//     return new Response(JSON.stringify({ error: 'Failed to fetch stats' }), {
//       headers: { 'Content-Type': 'application/json' },
//       status: 500,
//     });
//   }
// }

// import  poolPromise  from '@/lib/db';

export async function GET() {
  try {
    const pool = await getDbPool();
    const queryResult = await pool.query(`
      SELECT DOCT AS chart_doct, COUNT(*) AS count
      FROM SILVER_PATIENT_INFO
      WHERE OUTKIND = '99'
      GROUP BY DOCT
      UNION ALL
      SELECT ROOM AS chart_room, COUNT(*)
      FROM SILVER_PATIENT_INFO
      WHERE OUTKIND = '99'
      GROUP BY ROOM
    `);

//     const stats = queryResult.recordset.reduce((acc, row) => {
//       acc[row.chart_doct || row.chart_room] = row.count;
//       return acc;
//     }, {});

//     return new Response(JSON.stringify(stats), {
//       headers: { 'Content-Type': 'application/json' },
//       status: 200,
//     });
//   } catch (error) {
//     console.error('Error fetching statistics:', error);
//     return new Response(
//       JSON.stringify({ error: 'Failed to fetch statistics' }),
//       { status: 500, headers: { 'Content-Type': 'application/json' } }
//     );
//   }
//     const dbStats = queryResult.recordset.reduce(
//         (acc, row) => {
//         if (row.chart_room) {
//             acc.rooms[row.chart_room] = (acc.rooms[row.chart_room] || 0) + row.count;
//         } else if (row.chart_doct) {
//             acc.doctors[row.chart_doct] = (acc.doctors[row.chart_doct] || 0) + row.count;
//         }
//         return acc;
//         },
//         { rooms: {}, doctors: {} }
//     );
//    // reserve.json 통계 포함
//    const reserveData = readData();
//    reserveData.forEach((entry) => {
//      if (entry.chart_room) {
//        dbStats.rooms[entry.chart_room] =
//          (dbStats.rooms[entry.chart_room] || 0) + 1;
//      }
//      if (entry.chart_doct) {
//        dbStats.doctors[entry.chart_doct] =
//          (dbStats.doctors[entry.chart_doct] || 0) + 1;
//      }
//    });
    const dbStats = queryResult.recordset.reduce(
        (acc, row) => {
        if (row.chart_room) {
            acc.rooms[row.chart_room] = (acc.rooms[row.chart_room] || 0) + row.count;
        } else if (row.chart_doct) {
            acc.doctors[row.chart_doct] = (acc.doctors[row.chart_doct] || 0) + row.count;
        }
        return acc;
        },
        { rooms: {}, doctors: {} }
    );
  
  // reserve.json 통계 포함
    const reserveData = readData();
    reserveData.forEach((entry) => {
        if (entry.chart_room) {
        dbStats.rooms[entry.chart_room] =
            (dbStats.rooms[entry.chart_room] || 0) + 1;
        }
        if (entry.chart_doct) {
        dbStats.doctors[entry.chart_doct] =
            (dbStats.doctors[entry.chart_doct] || 0) + 1;
        }
  });
  
  // 병실 통계 정렬 및 남은 자리 계산
  const sortedRooms = Object.entries(dbStats.rooms)
    .map(([room, current]) => ({
      room,
      current,
      remaining: MAX_CAPACITY[room] ? MAX_CAPACITY[room] - current : null,
    }))
    .sort((a, b) => parseInt(a.room) - parseInt(b.room)); // 병실 번호 순 정렬
  
  // 결과 반환
  return NextResponse.json({
    doctors: dbStats.doctors,
    rooms: sortedRooms,
  });
  
 } catch (error) {
   console.error('Error in stats GET:', error);
   return NextResponse.json({ error: 'Failed to retrieve stats' }, { status: 500 });
 }
}

