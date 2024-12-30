import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { MAX_CAPACITY, ROOM_TYPE } from '@/lib/config';

// JSON 파일 경로
const CURRENT_JSON_PATH = path.join(process.cwd(), 'data', 'current.json');
const RESERVE_JSON_PATH = path.join(process.cwd(), 'data', 'reserve.json');

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

    // Reserve 통계 계산
    const reserveByDate = reserveData.reduce((acc, item) => {
      const date = item.chart_date_adm; // 입원 날짜
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({
        name: item.chart_name,
        gender: item.chart_gender,
      });
      return acc;
    }, {});

    const reserve = Object.entries(reserveByDate).map(([date, patients]) => ({
      date,
      patients,
    }));

    // JSON 응답 생성
    const response = {
      doctors,
      rooms: rooms.filter((room) => room.room !== '대기'),
      total,
      reserve, // 새로 추가된 항목
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating stats:', error);
    return NextResponse.json({ error: 'Failed to generate stats' }, { status: 500 });
  }
}
