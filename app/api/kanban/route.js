import fs from 'fs';
import path from 'path';
import sql from 'mssql';
import { getDbPool } from '@/lib/db';
import { NextResponse } from 'next/server';
import { syncCurrentData } from '@/lib/syncData';

const dataFilePath = path.join(process.cwd(), 'public', 'reserve.json');

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
        row2: `${row.chart_date_dc.slice(0, 4)}-${row.chart_date_dc.slice(4, 6)}-${row.chart_date_dc.slice(6, 8)}`,
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
