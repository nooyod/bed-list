
import React from "react";
import { Line } from "react-chartjs-2";
import { PatientStats } from "@/types/PatientStats";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LineChartProps {
  stats: PatientStats | null;
  date: string;
}

export default function LineChart({ stats, date }: LineChartProps) {
  // stats가 없을 경우 빈 배열 할당
  const inPatientStats = stats?.inPatientStats || [];

  // 날짜가 현재날짜(date)부터 20일 전까지 존재하는 데이터만 필터링
  const filteredStats = inPatientStats
    .filter((stat) => parseInt(stat.date) <= parseInt(date)) // 현재 날짜 이하의 데이터만 사용
    .sort((a, b) => a.date.localeCompare(b.date)); // 날짜 오름차순 정렬 (과거 → 현재)

  // x축: 날짜, y축: 총 입원 환자 수
  const dates = filteredStats.map((stat) => `${stat.date.slice(4, 6)}/${stat.date.slice(6, 8)}`);
  const patientCounts = filteredStats.map((stat) => stat.totalinpatient);
  const insurance00 = filteredStats.map((stat) => stat.insurance00);
  const insurance20 = filteredStats.map((stat) => stat.insurance20);

  const data = {
    labels: dates,
    datasets: [
      {
        label: "총 입원",
        data: patientCounts,
        borderColor: "#60A5FA",
        backgroundColor: "#60A5FA",
        fill: true,
        tension: 0.4,
      },
      {
        label: "건보",
        data: insurance00,
        borderColor: "#4ADE80", 
        backgroundColor: "#4ADE80", 
        fill: true,
        tension: 0.4,
      },
      {
        label: "자보",
        data: insurance20,
        borderColor: "#FBBF24",
        backgroundColor: "#FBBF24",
        fill: true,
        tension: 0.4,
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
      },
      y: {
        title: {
          display: false,
          text: "환자 수",
        },
        beginAtZero: false,
        suggestedMax: 43,
        suggestedMin: 20,
        ticks: {
          stepSize: 1, // 1단위 간격 (또는 10으로 변경 가능)
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}
