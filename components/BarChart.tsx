import React from "react";
import { Bar } from "react-chartjs-2";
import { PatientStats } from "@/types/PatientStats";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
  stats: PatientStats | null;
  date: string;
}

export default function Barchart({ stats, date }: BarChartProps) {
  // stats가 없을 경우 빈 배열 할당
  const inPatientStats = stats?.inPatientStats || [];

  // 날짜가 현재날짜(date)부터 20일 전까지 존재하는 데이터만 필터링
  const filteredStats = inPatientStats
    .filter((stat) => parseInt(stat.date) <= parseInt(date)) // 현재 날짜 이하의 데이터만 사용
    .sort((a, b) => a.date.localeCompare(b.date)); // 날짜 오름차순 정렬 (과거 → 현재)

  // x축: 날짜, y축: 총 입원 환자 수
  const dates = filteredStats.map((stat) => `${stat.date.slice(4, 6)}/${stat.date.slice(6, 8)}`);
  const patientCounts = filteredStats.map((stat) => stat.totalinpatient - stat.insurance00 - stat.insurance20);
  const insurance00 = filteredStats.map((stat) => stat.insurance00);
  const insurance20 = filteredStats.map((stat) => stat.insurance20);

  const data = {
    labels: dates,
    datasets: [
      {
        label: "건보",
        data: insurance00,
        backgroundColor: "rgba(74, 222, 128, 0.6)", 
        borderColor: "rgba(74, 222, 128, 1)",
        borderWidth: 1,
        barThickness: 20,
      },
      {
        label: "기타",
        data: patientCounts,
        backgroundColor: "rgba(168, 162, 158, 0.6)",
        borderColor: "rgba(168, 162, 158, 1)",
        borderWidth: 1,
        barThickness: 20,
      },
      {
        label: "자보",
        data: insurance20,
        backgroundColor: "rgba(251, 191, 36, 0.6)",
        borderColor: "rgba(251, 191, 36, 1)",
        borderWidth: 1,
        barThickness: 20,
      },

    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // 🔹 비율 고정 해제
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
    },
    scales: {
      x: {
        title: {
          display: false,
          text: "날짜",
        },
        stacked: true, // 막대 겹치기 활성화
      },
      y: {
        title: {
          display: false,
          text: "환자 수",
        },
        beginAtZero: true,
        // suggestedMax: 43,
        // suggestedMin: 20,
        ticks: {
          stepSize: 1, // 1단위 간격 (또는 10으로 변경 가능)
        },
        stacked: true, // 막대 겹치기 활성화
      },
    },
  };

  return <Bar data={data} options={options} />;
}

// import React from "react";
// import { Bar } from "react-chartjs-2";
// import { PatientStats } from "@/types/PatientStats";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// interface BarChartProps {
//   stats: PatientStats | null;
//   date: string;
// }

// interface CustomTooltipItem {
//   datasetIndex: number;
//   dataIndex: number;
//   raw: number;
// }

// export default function Barchart({ stats, date }: BarChartProps) {
//   // stats가 없을 경우 빈 배열 할당
//   const inPatientStats = stats?.inPatientStats || [];

//   // 날짜가 현재날짜(date)부터 20일 전까지 존재하는 데이터만 필터링
//   const filteredStats = inPatientStats
//     .filter((stat) => parseInt(stat.date) <= parseInt(date)) // 현재 날짜 이하의 데이터만 사용
//     .sort((a, b) => a.date.localeCompare(b.date)); // 날짜 오름차순 정렬 (과거 → 현재)

//   // x축: 날짜, y축: 총 입원 환자 수
//   const dates = filteredStats.map((stat) => `${stat.date.slice(4, 6)}/${stat.date.slice(6, 8)}`);
//   const insurance00 = filteredStats.map((stat) => stat.insurance00); // 건보
//   const insurance20 = filteredStats.map((stat) => stat.insurance20); // 자보
//   const totalInpatient = filteredStats.map((stat) => stat.totalinpatient); // 총 입원
//   const remainingInpatient = totalInpatient.map((total, idx) => total - (insurance00[idx] + insurance20[idx])); // 총 입원에서 건보+자보 뺀 값

//   const data = {
//     labels: dates,
//     datasets: [
//       {
//         label: "건보",
//         data: insurance00,
//         backgroundColor: "rgba(74, 222, 128, 0.6)", 
//         borderColor: "rgba(74, 222, 128, 1)",
//         borderWidth: 1,
//         barThickness: 20, // 막대 두께 조절
//         stack: "sameStack", // 🔹 하나의 막대로 합침
//       },
//       {
//         label: "자보",
//         data: insurance20,
//         backgroundColor: "rgba(251, 191, 36, 0.6)",
//         borderColor: "rgba(251, 191, 36, 1)",
//         borderWidth: 1,
//         barThickness: 20, // 막대 두께 조절
//         stack: "sameStack", // 🔹 하나의 막대로 합침
//       },
//       {
//         label: "총 입원",
//         data: remainingInpatient, // 원래 남은 값 (total - 건보 - 자보)
//         backgroundColor: "rgba(168, 162, 158, 0.6)",
//         borderColor: "rgba(168, 162, 158, 1)",
//         borderWidth: 1,
//         barThickness: 20, // 막대 두께 조절
//         stack: "sameStack", // 🔹 하나의 막대로 합침
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     maintainAspectRatio: false, // 🔹 비율 고정 해제
//     plugins: {
//       legend: {
//         display: true,
//         position: "top" as const,
//       },
//       tooltip: {
//         callbacks: {
//           label: function (tooltipItem: CustomTooltipItem) {
//             const datasetIndex = tooltipItem.datasetIndex as number;
//             const datasetLabel = data.datasets[datasetIndex].label as string;
//             const value = tooltipItem.raw as number;
//             const index = tooltipItem.dataIndex as number;

//             if (datasetLabel === "총 입원") {
//               return `총 입원: ${totalInpatient[index]}`; // 🔹 실제 총 입원 값 표시
//             }
//             return `${datasetLabel}: ${value}`;
//           },
//         },
//       },
//     },
//     scales: {
//       x: {
//         title: {
//           display: false,
//           text: "날짜",
//         },
//       },
//       y: {
//         title: {
//           display: false,
//           text: "환자 수",
//         },
//         beginAtZero: false,
//         suggestedMax: 43,
//         suggestedMin: 20,
//         stacked: true, // 🔹 모든 데이터가 한 막대 안에서 색상으로 구분됨
//       },
//     },
//   };

//   return <Bar data={data} options={options} />;
// }
