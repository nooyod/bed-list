// import fs from 'fs';
// import path from 'path';
// import { NextResponse } from 'next/server';

// const currentFilePath = path.join(process.cwd(), 'public', 'current.json');
// const reserveFilePath = path.join(process.cwd(), 'public', 'reserve.json');

// // 파일 읽기 유틸리티
// const readDataFromFile = (filePath) => {
//   if (!fs.existsSync(filePath)) {
//     return [];
//   }
//   const data = fs.readFileSync(filePath, 'utf8');
//   return JSON.parse(data);
// };

// export async function GET(request) {
//   const { searchParams } = new URL(request.url);
//   const key = searchParams.get('key'); // 요청에서 key 값을 가져옴

//   if (!key) {
//     return NextResponse.json({ success: false, message: 'Key is required' }, { status: 400 });
//   }

//   try {
//     // 1. current.json에서 데이터 검색
//     const currentData = readDataFromFile(currentFilePath);
//     const currentRow = currentData.find(
//       (item) => String(item.chart_number) === key
//     );

//     if (currentRow) {
//       return NextResponse.json(currentRow); // current.json에서 데이터가 있으면 반환
//     }

//     // 2. reserve.json에서 데이터 검색
//     const reserveData = readDataFromFile(reserveFilePath);
//     const reserveRow = reserveData.find(
//       (item) => String(item.index) === key || String(item.chart_number) === key
//     );

//     if (reserveRow) {
//       return NextResponse.json(reserveRow); // reserve.json에서 데이터가 있으면 반환
//     }

//     return NextResponse.json({ success: false, message: 'Data not found' }, { status: 404 });
//   } catch (error) {
//     console.error('Error in RETRIEVE function:', error);
//     return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
//   }
// }

import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const currentFilePath = path.join(process.cwd(), 'public', 'current.json');
const reserveFilePath = path.join(process.cwd(), 'public', 'reserve.json');

const readFile = (filePath : any) => {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

export async function GET(request : Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (!key) {
    return NextResponse.json({ success: false, message: 'Key is required' }, { status: 400 });
  }

  const currentData = readFile(currentFilePath);
  const reserveData = readFile(reserveFilePath);
  const result =
    currentData.find((item: any) => String(item.chart_number) === key) ||
    reserveData.find((item: any) => String(item.index) === key);

  if (result) {
    return NextResponse.json(result);
  }
  return NextResponse.json({ success: false, message: 'Data not found' }, { status: 404 });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { chart_number } = body;

    if (!chart_number) {
      return NextResponse.json({ success: false, message: 'Chart number is required' }, { status: 400 });
    }

    const currentData = readFile(currentFilePath);
    const reserveData = readFile(reserveFilePath);

    // Update in current.json
    const currentIndex = currentData.findIndex((item : any) => String(item.chart_number) === chart_number);
    if (currentIndex !== -1) {
      currentData[currentIndex] = { ...currentData[currentIndex], ...body };
      fs.writeFileSync(currentFilePath, JSON.stringify(currentData, null, 2), 'utf8');
    }

    // Update in reserve.json
    const reserveIndex = reserveData.findIndex((item : any) => String(item.index) === chart_number);
    if (reserveIndex !== -1) {
      reserveData[reserveIndex] = { ...reserveData[reserveIndex], ...body };
      fs.writeFileSync(reserveFilePath, JSON.stringify(reserveData, null, 2), 'utf8');
    }

    return NextResponse.json({ success: true, message: 'Data updated successfully' });
  } catch (error) {
    console.error('Error in PUT function:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// import { NextResponse } from 'next/server';
// import fs from 'fs';
// import path from 'path';

// const publicDir = path.join(process.cwd(), 'public');
// const currentDataPath = path.join(publicDir, 'current.json');
// const reserveDataPath = path.join(publicDir, 'reserve.json');

// // JSON 데이터 로드 함수
// const loadJson = (filePath: string) => {
//   try {
//     const data = fs.readFileSync(filePath, 'utf-8');
//     return JSON.parse(data);
//   } catch (error) {
//     console.error(`Error reading JSON file at ${filePath}:`, error);
//     return null;
//   }
// };

// // JSON 데이터 저장 함수
// const saveJson = (filePath: string, data: any) => {
//   try {
//     fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
//   } catch (error) {
//     console.error(`Error writing JSON file at ${filePath}:`, error);
//     throw new Error('Failed to save JSON file');
//   }
// };

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const key = searchParams.get('key');

//   if (!key) {
//     return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
//   }

//   const currentData = loadJson(currentDataPath) || [];
//   const reserveData = loadJson(reserveDataPath) || [];

//   const data =
//     currentData.find((item: any) => item.chart_number === key) ||
//     reserveData.find((item: any) => item.index === key);

//   if (!data) {
//     return NextResponse.json({ error: 'Data not found' }, { status: 404 });
//   }

//   return NextResponse.json(data);
// }

// // export async function PUT(request: Request) {
// //   const body = await request.json();
// //   const { id, source, ...updatedData } = body;

// //   if (!id || !source) {
// //     return NextResponse.json({ error: 'Missing id or source parameter' }, { status: 400 });
// //   }

// //   // 수정 대상 파일 결정
// //   const filePath = source === 'current' ? currentDataPath : reserveDataPath;
// //   const data = loadJson(filePath);

// //   if (!data) {
// //     return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
// //   }

// //   // 데이터 업데이트
// //   const index = data.findIndex((item: any) => item.id === id);
// //   if (index === -1) {
// //     return NextResponse.json({ error: 'Data not found' }, { status: 404 });
// //   }

// //   data[index] = { ...data[index], ...updatedData };

// //   // JSON 파일 저장
// //   try {
// //     saveJson(filePath, data);
// //     return NextResponse.json({ success: true, data: data[index] });
// //   } catch (error) {
// //     console.error('Error updating data:', error);
// //     return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
// //   }
// // }

// export async function PUT(request: Request) {
//   try {
//     const body = await request.json();
//     const { chart_number } = body;

//     if (!chart_number) {
//       return NextResponse.json({ success: false, message: 'Chart number is required' }, { status: 400 });
//     }

//     const currentData = loadJson(currentDataPath) || [];
//     const reserveData = loadJson(reserveDataPath) || [];

//     // Update in current.json
//     const currentIndex = currentData.findIndex((item : any) => String(item.chart_number) === chart_number);
//     if (currentIndex !== -1) {
//       currentData[currentIndex] = { ...currentData[currentIndex], ...body };
//       fs.writeFileSync(currentDataPath, JSON.stringify(currentData, null, 2), 'utf8');
//     }

//     // Update in reserve.json
//     const reserveIndex = reserveData.findIndex((item : any) => String(item.chart_number) === chart_number);
//     if (reserveIndex !== -1) {
//       reserveData[reserveIndex] = { ...reserveData[reserveIndex], ...body };
//       fs.writeFileSync(reserveDataPath, JSON.stringify(reserveData, null, 2), 'utf8');
//     }

//     return NextResponse.json({ success: true, message: 'Data updated successfully' });
//   } catch (error) {
//     console.error('Error in PUT function:', error);
//     return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
//   }
// }