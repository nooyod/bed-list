import React from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface ChartProps {
  series: number[];
  labels: string[];
  title: string;
}

const Chart: React.FC<ChartProps> = ({ series, labels, title }) => {
  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Satoshi, sans-serif",
    },
    colors: ["#3C50E0", "#6577F3", "#8FD0EF", "#0FADCF", "#FFB64D"],
    labels: labels,
    legend: {
      show: true,
      position: "bottom",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          background: "transparent",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
  };

  return (
    <div className="rounded-sm border bg-white p-5 shadow">
      <h5 className="text-xl font-semibold mb-3">{title}</h5>
      <ReactApexChart options={options} series={series} type="donut" />
    </div>
  );
};

export default Chart;
