// import React from "react";

// interface TopSectionProps {
//   selectedDate: string;
//   onDateChange: (date: string) => void;
// }

// export default function TopSection({ selectedDate, onDateChange }: TopSectionProps) {
//     const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         onDateChange(event.target.value.replace(/-/g, ""));
//       };
//   return (
//     <div className="bg-gray-100 p-4 rounded-lg flex items-center gap-4">
//       <div>
//         <label htmlFor="date" className="block text-sm font-medium">
//           날짜 선택:
//         </label>
//         <input
//           type="date"
//           id="date"
//           value={selectedDate.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")}
//           onChange={(e) => onDateChange(e.target.value)}
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
//         />
//       </div>
//       {/* <div className="flex-1 text-center">
//         <p className="text-sm text-gray-500">추가 정보가 여기에 표시됩니다.</p>
//       </div> */}
//     </div>
//   );
// }

// import React from "react";

// interface TopSectionProps {
//   selectedDate: string; // yyyymmdd 형식
//   onDateChange: (date: string) => void;
// }

// export default function TopSection({ selectedDate, onDateChange }: TopSectionProps) {
//   // 날짜 변경 핸들러
//   const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const formattedDate = event.target.value.replace(/-/g, ""); // yyyy-mm-dd → yyyymmdd
//     onDateChange(formattedDate);
//   };

//   return (
//     <div className="bg-gray-100 p-4 rounded-lg flex items-center gap-4">
//       <div>
//         <label htmlFor="date" className="block text-sm font-medium">
//           날짜 선택:
//         </label>
//         <input
//           type="date"
//           id="date"
//           value={selectedDate.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")} // yyyymmdd → yyyy-mm-dd
//           onChange={handleDateChange}
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
//         />
//       </div>
//     </div>
//   );
// }

"use client";

import React from "react";
import { PatientStats } from "@/types/PatientStats";

interface TopSectionProps {
  selectedDate: string; // yyyymmdd
  onDateChange: (date: string) => void;
  stats: PatientStats | null;
}

export default function TopSection({ selectedDate, onDateChange, stats }: TopSectionProps) {
  // 날짜 변경 핸들러
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedDate = event.target.value.replace(/-/g, ""); // yyyy-mm-dd → yyyymmdd
    onDateChange(formattedDate);
  };

  // 선택한 날짜의 매출 통계
  const inSales =
    stats?.inSalesStats.salesStats.find((item) => item.date === selectedDate)?.inSales ?? 0;
  const outSales =
    stats?.outSalesStats.salesStats.find((item) => item.date === selectedDate)?.outSales ?? 0;
  const totalSales = inSales + outSales;

  // 숫자 천 단위 콤마
  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between">
      <div>
        <label htmlFor="date" className="block text-sm font-medium">
          날짜 선택:
        </label>
        <input
          type="date"
          id="date"
          value={selectedDate.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")}
          onChange={handleDateChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      {/* 매출 정보 */}
      <div className="space-y-1 w-48">
        <div className="flex justify-between px-2">
          <span className="text-gray-700">외래매출</span>
          <span className="font-mono">{formatNumber(outSales)}원</span>
        </div>
        <div className="flex justify-between px-2">
          <span className="text-gray-700">입원매출</span>
          <span className="font-mono">{formatNumber(inSales)}원</span>
        </div>
        <div className="flex justify-between px-2 font-bold border-t border-gray-300 pt-1">
          <span>일매출</span>
          <span className="font-mono">{formatNumber(totalSales)}원</span>
        </div>
      </div>
    </div>
  );
}

