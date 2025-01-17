// "use client";

// import { useState, useEffect } from "react";
// import Chart from "@/components/Chart";

// export default function PatientPage() {
//   const [date, setDate] = useState<string>(() => {
//     const today = new Date();
//     return today.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
//   });
//   const [stats, setStats] = useState<any>(null);

//   const fetchStats = async () => {
//     try {
//       const response = await fetch(`/api/patient?date=${date}`);
//       const data = await response.json();
//       setStats(data);
//     } catch (error) {
//       console.error("Error fetching patient stats:", error);
//     }
//   };

//   useEffect(() => {
//     fetchStats();
//   }, [date]);

//   const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setDate(event.target.value.replace(/-/g, ""));
//   };

//   if (!stats) return <p>Loading...</p>;

//   const insuranceLabels = ["건보", "급여", "자보", "산재", "일반"];
//   const insuranceData = [
//     stats.insurance0,
//     stats.insurance1,
//     stats.insurance2,
//     stats.insurance3,
//     stats.insurance5,
//   ];

//   return (
//     <div className="container mx-auto p-4">
//       <div className="mb-4">
//         <label htmlFor="date" className="block text-sm font-medium">
//           날짜 선택:
//         </label>
//         <input
//           type="date"
//           id="date"
//           value={date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")}
//           onChange={handleDateChange}
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
//         />
//       </div>

//       <div>
//         <p>현재: {stats.totalinpatient}명</p>
//         <p>입원: {stats.todayadm}명</p>
//         <p>퇴원: {stats.todaydc}명</p>
//       </div>

//       <div className="mt-6 flex flex-wrap gap-4">
//         <Chart series={insuranceData} labels={insuranceLabels} title="보험 구분" />
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
// import Chart from "@/components/Chart";
import PieChart from "@/components/PieChart";

interface PatientStats {
  silverStats: {
    totalinpatient: number;
    todayadm: number;
    todaydc: number;
    insurance0: number;
    insurance1: number;
    insurance2: number;
    insurance3: number;
    insurance5: number;
  };
  jubStats: {
    in_total: number;
    in_new: number;
    in_first: number;
    in_again: number;
    in_total_0: number;
    in_total_1: number;
    in_total_2: number;
    filteredList: {
      jubCham: string;
      jubChoJae: number;
      chamWhanja: string;
      partName: string;
      jubTprt: number;
      chamMemo2: string;
    }[];
  };
}

export default function PatientPage() {
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  });
  const [stats, setStats] = useState<PatientStats | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/patient?date=${date}`);
      const data: PatientStats = await response.json();
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

  // 보험 데이터
  const insuranceLabels = ["건보", "급여", "자보", "산재", "일반"];
  const insuranceData = [
    stats.silverStats.insurance0,
    stats.silverStats.insurance1,
    stats.silverStats.insurance2,
    stats.silverStats.insurance3,
    stats.silverStats.insurance5,
  ];

  // 외래 데이터
  const outpatientLabels = ["건보", "산재", "자보"];
  const outpatientData = [
    stats.jubStats.in_total_0,
    stats.jubStats.in_total_1,
    stats.jubStats.in_total_2,
  ];

  // 목록 데이터
  const filteredList = stats.jubStats.filteredList;

  return (
    <div className="container mx-auto p-4">
      {/* 날짜 선택 */}
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

      {/* 통계 정보 */}
      <div>
        <p>현재: {stats.silverStats.totalinpatient}명</p>
        <p>입원: {stats.silverStats.todayadm}명</p>
        <p>퇴원: {stats.silverStats.todaydc}명</p>
      </div>

      {/* 보험 구분 차트 */}
      {/* <div className="mt-6 flex flex-wrap gap-4"> */}
        {/* <Chart series={insuranceData} labels={insuranceLabels} title="보험 구분" /> */}
      {/* </div> */}
      <div className="mt-6 flex flex-wrap gap-4">
        <PieChart data={insuranceData} labels={insuranceLabels} />
      </div>

      <div>
        <p>외래: {stats.jubStats.in_total}명</p>
        <p>재진: {stats.jubStats.in_again}명</p>
        <p>신규: {stats.jubStats.in_new}명</p>
        <p>초진: {stats.jubStats.in_first}명</p>
      </div>

      {/* 외래 구분 차트 */}
      {/* <div className="mt-6 flex flex-wrap gap-4"> */}
        {/* <Chart series={outpatientData} labels={outpatientLabels} title="외래 구분" /> */}
      {/* </div> */}
      <div className="mt-6 flex flex-wrap gap-4">
        <PieChart data={outpatientData} labels={outpatientLabels} />
      </div>

      {/* 목록 출력 */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">초진 환자</h2>
        <table className="min-w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">챠트번호</th>
              <th className="border border-gray-300 px-4 py-2">이름</th>
              <th className="border border-gray-300 px-4 py-2">유형</th>
              <th className="border border-gray-300 px-4 py-2">유입</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((row, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-4 py-2">{row.jubCham}</td>
                <td className="border border-gray-300 px-4 py-2">{row.chamWhanja}</td>
                <td className="border border-gray-300 px-4 py-2">{row.partName}</td>
                <td className="border border-gray-300 px-4 py-2">{row.chamMemo2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

