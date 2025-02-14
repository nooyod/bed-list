import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { MAX_CAPACITY, ROOM_TYPE, doctorMap } from '@/lib/config';

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
    const doctors = allData
    .filter(entry => !(entry.chart_check_dc && entry.chart_date_dc === new Date().toISOString().slice(0, 10)))
    .reduce((acc, entry) => {
      const doctor = entry.chart_doct2 || entry.chart_doct;
      if (doctor) {
        acc[doctor] = (acc[doctor] || 0) + 1;
      }
      return acc;
    }, {});

    const sortedDoctors = Object.keys(doctorMap).reduce((acc, doctorName) => {
      const mappedDepartment = doctorMap[doctorName];
      if (doctors[mappedDepartment] > 0) {
        acc[mappedDepartment] = doctors[mappedDepartment];
      }
      return acc;
    }, {});
   
    // Rooms 통계 계산
    const rooms = Object.keys(MAX_CAPACITY).map((room) => {
      const occupants = allData.filter((entry) => {
        const isChartDateDcToday =
          entry.chart_date_dc === new Date().toISOString().slice(0, 10); // 오늘 날짜 확인
        const hasChartCheckDc = Boolean(entry.chart_check_dc); // 값이 있는지 확인
    
        // 조건을 만족하지 않는 데이터만 포함
        return (
          entry.chart_room === room &&
          !(isChartDateDcToday && hasChartCheckDc) // 두 조건 모두 만족하면 제외
        );
      });

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
        remaining: Math.max(0, MAX_CAPACITY[room] - occupants.length), // 음수 방지
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
        // chart_room이 "대기"인 사람 제외
      if (item.chart_room === "전실") {
        return acc; // 현재 항목을 건너뜀
      }
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({
        name: item.chart_name,
        gender: item.chart_gender,
        insurance: item.chart_insurance,
      });
      return acc;
    }, {});

    const sortedReserveByDate = Object.keys(reserveByDate)
  .sort((a, b) => a.localeCompare(b)) // 문자열 비교로 정렬
  .reduce((acc, date) => {
    acc[date] = reserveByDate[date];
    return acc;
  }, {});

    const reserve = Object.entries(sortedReserveByDate).map(([date, patients]) => ({
      date,
      patients,
    }));

    // JSON 응답 생성
    const response = {
      sortedDoctors,
      rooms: rooms.filter((room) => room.room !== '대기' && room.room !== '변경'),
      total,
      reserve, // 새로 추가된 항목
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating stats:', error);
    return NextResponse.json({ error: 'Failed to generate stats' }, { status: 500 });
  }
}
