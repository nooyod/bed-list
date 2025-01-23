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

import React from "react";

interface TopSectionProps {
  selectedDate: string; // yyyymmdd 형식
  onDateChange: (date: string) => void;
}

export default function TopSection({ selectedDate, onDateChange }: TopSectionProps) {
  // 날짜 변경 핸들러
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedDate = event.target.value.replace(/-/g, ""); // yyyy-mm-dd → yyyymmdd
    onDateChange(formattedDate);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg flex items-center gap-4">
      <div>
        <label htmlFor="date" className="block text-sm font-medium">
          날짜 선택:
        </label>
        <input
          type="date"
          id="date"
          value={selectedDate.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")} // yyyymmdd → yyyy-mm-dd
          onChange={handleDateChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
    </div>
  );
}
