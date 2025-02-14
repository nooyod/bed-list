import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { syncCurrentData } from '@/lib/syncData';
import { doctorIconMap, insusubMap, funnelMap, predefinedColumns } from '@/lib/config';

const dataFilePath = path.join(process.cwd(), 'data', 'reserve.json');

const readData = () => {
  if (!fs.existsSync(dataFilePath)) {
    return [];
  }
  const data = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(data);
};

export async function GET() {
  try {
    const kanbanData = predefinedColumns.reduce((board, columnName) => {
      board[columnName] = [];
      return board;
    }, {});
    
    const today = new Date().toISOString().split('T')[0];

    const result = await syncCurrentData();
    result.forEach((row) => {
      const card = {
        id: row.chart_number,
        row1: `${row.chart_number.slice(-5)} ${row.chart_name}`,
        row2: `${row.chart_date_adm.slice(4,6)}/${row.chart_date_adm.slice(6,8)}~${row.chart_date_dc.slice(-5).replace('-', '/')}${row.chart_check_dc ? '📌' : ''}`,
        row3: `${doctorIconMap[row.chart_doct]} (${insusubMap[row.chart_insurance] || 'unknown'})`,
        origin: 'current',
        today: row.chart_date_dc === today ? 'today' : 'default', // 색상 결정
        gender: row.chart_gender, // 성별에 따라 아이콘 결정
        name: row.chart_name, // 이름
        number: row.chart_number.slice(-5), // 번호
        date_dc: row.chart_date_dc, // 퇴원 날짜
        date_dc_check: row.chart_check_dc, // 퇴원 확인 여부
        date_stay: row.chart_date_stay, // 입원 날짜
        doct: doctorIconMap[row.chart_doct], // 담당 의사
        insurance: insusubMap[row.chart_insurance], // 보험 정보
        memo: row.chart_memo ? '🧣' : ' ', // 메모
        funnel: funnelMap[row.chart_funnel.slice(0,3)], // 퍼널 정보
      };
      if (kanbanData[row.chart_room]) {
        kanbanData[row.chart_room].push(card);
      }
    });

    const fileContent = readData();

    fileContent.forEach((row) => {
      let card;

      if (row.chart_room === '전실') {
        card = {
          id: row.index,
          row1: `[${row.index}] ${row.chart_name}`, // 이름과 인덱스
          row2: row.chart_memo, // 메모
          origin: 'change', // 'change'로 변경
        };
      } else {
        card = {
          id: row.index,
          row1: `[${row.index}]${row.chart_name}`, // 이름과 인덱스
          row2: `${row.chart_date_adm.slice(4, 6)}/${row.chart_date_adm.slice(6, 8)}`, // 날짜 형식 변환
          row3: `${row.chart_funnel} (${row.chart_insurance})`, // 추가 정보
          origin: 'reserve', // 'reserve'로 기본 설정
        };
      }
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
