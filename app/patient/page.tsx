// "use client";

// import { useEffect, useState } from "react";

// interface PatientStats {
//   totalinpatient: number;
//   todayadm: number;
//   todaydc: number;
//   insurance0: number;
//   insurance1: number;
//   insurance2: number;
//   insurance3: number;
//   insurance5: number;
// }

// export default function PatientPage() {
//   const [date, setDate] = useState(() => {
//     const today = new Date();
//     return today.toISOString().slice(0, 10).replace(/-/g, ""); // yyyymmdd 형식
//   });
//   const [stats, setStats] = useState<PatientStats | null>(null);
//   const [loading, setLoading] = useState(true);

//   const fetchStats = async (selectedDate: string) => {
//     setLoading(true);
//     try {
//       const response = await fetch(`/api/patient?date=${selectedDate}`);
//       const data = await response.json();
//       setStats(data);
//     } catch (error) {
//       console.error("Error fetching patient statistics:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStats(date);
//   }, [date]);

//   const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setDate(e.target.value.replace(/-/g, "")); // yyyymmdd 형식
//   };

//   return (
//     <div className="patient-container">
//       <h1>환자 현황</h1>
//       <label htmlFor="date">날짜:</label>
//       <input
//         id="date"
//         type="date"
//         value={`${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`}
//         onChange={handleDateChange}
//       />
//       {loading ? (
//         <p>Loading...</p>
//       ) : stats ? (
//         <div>
//           <p>현재 : {stats.totalinpatient}명</p>
//           <p>입원 : {stats.todayadm}명</p>
//           <p>퇴원 : {stats.todaydc}명</p>
//           <p>보험 구분</p>
//             <ul>
//                 <li>건보: {stats.insurance0}명</li>
//                 <li>급여: {stats.insurance1}명</li>
//                 <li>자보: {stats.insurance2}명</li>
//                 <li>산재: {stats.insurance3}명</li>
//                 <li>일반: {stats.insurance5}명</li>
//             </ul>
//         </div>
//       ) : (
//         <p>데이터를 불러오지 못했습니다.</p>
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import Chart from "@/components/Chart";

export default function PatientPage() {
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  });
  const [stats, setStats] = useState<any>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/patient?date=${date}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching patient stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [date]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDate(event.target.value.replace(/-/g, ""));
  };

  if (!stats) return <p>Loading...</p>;

  const insuranceLabels = ["건보", "급여", "자보", "산재", "일반"];
  const insuranceData = [
    stats.insurance0,
    stats.insurance1,
    stats.insurance2,
    stats.insurance3,
    stats.insurance5,
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <label htmlFor="date" className="block text-sm font-medium">
          날짜 선택:
        </label>
        <input
          type="date"
          id="date"
          value={date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")}
          onChange={handleDateChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <p>현재: {stats.totalinpatient}명</p>
        <p>입원: {stats.todayadm}명</p>
        <p>퇴원: {stats.todaydc}명</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <Chart series={insuranceData} labels={insuranceLabels} title="보험 구분" />
      </div>
    </div>
  );
}
