import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

// 최대 수용 인원 설정
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
};

const ROOM_TYPE = {
  "201호": "4인실",
  "202호": "2인실",
  "203호": "다인실",
  "205호": "다인실",
  "206호": "다인실",
  "207호": "다인실",
  "208호": "4인실",
  "209호": "2인실",
  "210호": "2인실",
};

// JSON 파일 경로
const CURRENT_JSON_PATH = path.join(process.cwd(), 'public', 'current.json');
const RESERVE_JSON_PATH = path.join(process.cwd(), 'public', 'reserve.json');

export async function GET() {
  try {
    // current.json과 reserve.json 읽기
    const [currentData, reserveData] = await Promise.all([
      fs.readFile(CURRENT_JSON_PATH, 'utf-8').then(JSON.parse).catch(() => []),
      fs.readFile(RESERVE_JSON_PATH, 'utf-8').then(JSON.parse).catch(() => []),
    ]);

    // 두 JSON 데이터를 병합
    const allData = [...currentData, ...reserveData];

    // Doctors 통계 계산
    const doctors = allData.reduce((acc, entry) => {
      const doctor = entry.chart_doct2 || entry.chart_doct;
      if (doctor) {
        acc[doctor] = (acc[doctor] || 0) + 1;
      }
      return acc;
    }, {});

    // Rooms 통계 계산
    const rooms = Object.keys(MAX_CAPACITY).map((room) => {
      const occupants = allData.filter((entry) => entry.chart_room === room);
      const genderCounts = occupants.reduce(
        (acc, entry) => {
          if (entry.chart_gender === '남자') acc.male += 1;
          if (entry.chart_gender === '여자') acc.female += 1;
          return acc;
        },
        { male: 0, female: 0 }
      );

      const gender =
        genderCounts.male > 0 && genderCounts.female > 0
          ? '공용'
          : genderCounts.male > 0
          ? '남자'
          : genderCounts.female > 0
          ? '여자'
          : '공용';

      return {
        room,
        gender,
        remaining: MAX_CAPACITY[room] - occupants.length,
      };
    });

    // Total 통계 계산
    const total = ['남자', '여자', '공용'].map((gender) => {
      const roomTypes = { "2인실": 0, "4인실": 0, "다인실": 0 };

      rooms.forEach((room) => {
        if (room.gender === gender) {
          const type = ROOM_TYPE[room.room];
          roomTypes[type] += room.remaining;
        }
      });

      return {
        gender,
        ...roomTypes,
      };
    });

    // JSON 응답 생성
    const response = {
      doctors,
      rooms: rooms.filter((room) => room.room !== '대기'),
      total,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating stats:', error);
    return NextResponse.json({ error: 'Failed to generate stats' }, { status: 500 });
  }
}
