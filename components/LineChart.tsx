import React from "react";
import { Line } from "react-chartjs-2";
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
  dates: string[]; // x축 데이터
  patientCounts: number[]; // y축 데이터
}

export default function LineChart({ dates, patientCounts }: LineChartProps) {
  const data = {
    labels: dates,
    datasets: [
      {
        label: "총 외래 환자 수",
        data: patientCounts,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "날짜",
        },
      },
      y: {
        title: {
          display: true,
          text: "환자 수",
        },
        beginAtZero: true,
      },
    },
  };

  return <Line data={data} options={options} />;
}
