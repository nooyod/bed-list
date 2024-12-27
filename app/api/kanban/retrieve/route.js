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

const writeDataToFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
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

export async function POST(request) {
  try {
    const body = await request.json();
    const reserveData = readDataFromFile(reserveFilePath);

    const newEntry = {
      index: reserveData.length + 1,
      chart_name: body.chart_name,
      chart_gender: body.chart_gender,
      chart_date_adm: body.chart_date_adm,
      chart_insurance: body.chart_insurance,
      chart_funnel: body.chart_funnel,
      chart_room: body.chart_room,
    };

    reserveData.push(newEntry);
    writeDataToFile(reserveFilePath, reserveData);

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error('Error in POST function:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}

// DELETE 요청: 데이터 삭제
export async function DELETE(request) {
  try {
    const body = await request.json();
    const reserveData = readDataFromFile(reserveFilePath);

    const updatedData = reserveData
      .filter((entry) => String(entry.index) !== String(body.key))
      .map((entry, idx) => ({ ...entry, index: idx + 1 }));

    writeDataToFile(reserveFilePath, updatedData);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE function:', error);
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { key, updates } = body; // key: 검색 키, updates: 수정할 데이터

    if (!key || !updates) {
      return NextResponse.json(
        { success: false, message: 'Key and updates are required' },
        { status: 400 }
      );
    }

    let fileUpdated = false;

    // 1. current.json에서 데이터 수정
    const currentData = readDataFromFile(currentFilePath);
    const currentIndex = currentData.findIndex(
      (item) => String(item.chart_number) === String(key)
    );

    if (currentIndex !== -1) {
      currentData[currentIndex] = {
        ...currentData[currentIndex],
        ...updates,
      };
      writeDataToFile(currentFilePath, currentData);
      fileUpdated = true;
    }

    // 2. reserve.json에서 데이터 수정
    const reserveData = readDataFromFile(reserveFilePath);
    const reserveIndex = reserveData.findIndex(
      (item) => String(item.index) === String(key)
    );

    if (reserveIndex !== -1) {
      reserveData[reserveIndex] = {
        ...reserveData[reserveIndex],
        ...updates,
      };
      writeDataToFile(reserveFilePath, reserveData);
      fileUpdated = true;
    }

    if (!fileUpdated) {
      return NextResponse.json(
        { success: false, message: 'Data not found in either file' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Data updated successfully' });
  } catch (error) {
    console.error('Error in PATCH function:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}