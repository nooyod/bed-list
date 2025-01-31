import React from "react";
import { PatientStats } from "@/types/PatientStats";
import Card from "@/components/StatCard";
import DonutChart from "@/components/PieChart";
import Table from "@/components/Table";
import LineChart from "@/components/LineChart";
import { FaHospitalAlt, FaHospitalUser, FaUserPlus, FaUserCheck } from "react-icons/fa";

interface LeftSectionProps {
  stats: PatientStats | null;
  dates: string[];
  patientCounts: number[];
}

export default function LeftSection({ stats, dates, patientCounts }: LeftSectionProps) {
  if (!stats) {
    return <p>데이터를 불러오는 중입니다...</p>;
  }

  // 카드 데이터
  const outpatientCards = [
    { title: "총 외래", value: stats.jubStats.in_total, description:"총 외래 환자 수", icon:FaHospitalAlt, color:"bg-blue-100" },
    { title: "신규 환자", value: stats.jubStats.in_new, description: "신규 환자 수", icon: FaHospitalUser, color: "bg-green-100" },
    { title: "초진 환자", value: stats.jubStats.in_first, description: "초진 환자 수", icon: FaUserCheck, color: "bg-yellow-100" },
    { title: "재진 환자", value: stats.jubStats.in_again, description: "재진 환자 수", icon: FaUserCheck, color: "bg-red-100" },
  ];

  // 파이차트 데이터
  const pieLabels = ["건보", "산재", "자보"];
  const pieData = [
    stats.jubStats.in_total_0,
    stats.jubStats.in_total_1,
    stats.jubStats.in_total_2,
  ];

  const filteredList = stats.jubStats.filteredList;

  return (
    <section className="left-section p-4 bg-gray-100 rounded-md">
      <h2 className="text-xl font-bold mb-4">외래 정보</h2>

      {/* 카드들 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {outpatientCards.map((card, index) => (
          <Card key={index} title={card.title} value={card.value} description={card.description} icon={card.icon} color={card.color}/>
        ))}
      </div>

      {/* 파이차트 */}
      <div className="mb-6">
        <DonutChart data={pieData} labels={pieLabels} />
      </div>

      <h2 className="text-xl font-bold mb-4">외래 통계</h2>
      <div className="mb-6">
        <LineChart dates={dates} patientCounts={patientCounts} />
      </div>

      {/* 리스트 */}
      <h3 className="text-lg font-semibold mb-2">초진 환자 목록 </h3>
        <div className="mt-4">
          <Table
            headers={["번호", "이름", "유형", "유입"]}
            rows={filteredList.map((item: { jubCham: string; chamWhanja: string; partName: string; chamMemo2: string }) => [
              item.jubCham,
              item.chamWhanja,
              item.partName,
              item.chamMemo2,
            ])}
          />
        </div>
    </section>
  );
}
