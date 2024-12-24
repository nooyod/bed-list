import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const currentFilePath = path.join(process.cwd(), 'public', 'current.json');
const reserveFilePath = path.join(process.cwd(), 'public', 'reserve.json');

// 파일 읽기 유틸리티
const readDataFromFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key'); // 요청에서 key 값을 가져옴

  if (!key) {
    return NextResponse.json({ success: false, message: 'Key is required' }, { status: 400 });
  }

  try {
    // 1. current.json에서 데이터 검색
    const currentData = readDataFromFile(currentFilePath);
    const currentRow = currentData.find(
      (item) => String(item.chart_number) === key
    );

    if (currentRow) {
      return NextResponse.json(currentRow); // current.json에서 데이터가 있으면 반환
    }

    // 2. reserve.json에서 데이터 검색
    const reserveData = readDataFromFile(reserveFilePath);
    const reserveRow = reserveData.find(
      (item) => String(item.index) === key || String(item.chart_number) === key
    );

    if (reserveRow) {
      return NextResponse.json(reserveRow); // reserve.json에서 데이터가 있으면 반환
    }

    return NextResponse.json({ success: false, message: 'Data not found' }, { status: 404 });
  } catch (error) {
    console.error('Error in RETRIEVE function:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
