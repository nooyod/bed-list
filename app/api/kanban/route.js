import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { syncCurrentData } from '@/lib/syncData';
import { insusubMap, doctorMap, predefinedColumns } from '@/lib/config';

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

    const result = await syncCurrentData();
    result.forEach((row) => {
      const card = {
        id: row.chart_number,
        row1: `${row.chart_number.slice(-5)} ${row.chart_name}`,
        row2: `${row.chart_date_dc}`,
        row3: `${row.chart_doct} (${insusubMap[row.chart_insurance] || 'unknown'})`,
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
        row2: `${row.chart_date_adm}`,
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
