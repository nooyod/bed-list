import React from "react";
import { PatientStats } from "@/types/PatientStats";
import Card from "@/components/StatCard";
import DonutChart from "@/components/PieChart";

interface RightSectionProps {
  stats: PatientStats | null;
  date: string;
}

export default function RightSection({ stats, date }: RightSectionProps) {
  if (!stats) {
    return <p>데이터를 불러오는 중입니다...</p>;
  }

  // 카드 데이터
  const inpatientCards = [
    { title: "현재 입원", value: stats.silverStats.totalinpatient },
    { title: "오늘 입원", value: stats.silverStats.todayadm },
    { title: "오늘 퇴원", value: stats.silverStats.todaydc },
  ];

  // 파이차트 데이터
  const pieLabels = ["건보", "급여", "자보", "산재", "일반"];
  const pieData = [
    stats.silverStats.insurance0,
    stats.silverStats.insurance1,
    stats.silverStats.insurance2,
    stats.silverStats.insurance3,
    stats.silverStats.insurance5,
  ];

//   const filteredList = stats.jubStats.filteredList;

  return (
    <section className="left-section p-4 bg-gray-100 rounded-md">
      <h2 className="text-xl font-bold mb-4">외래 정보</h2>

      {/* 카드들 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {inpatientCards.map((card, index) => (
          <Card key={index} title={card.title} value={card.value} />
        ))}
      </div>

      {/* 파이차트 */}
      <div className="mb-6">
        <DonutChart data={pieData} labels={pieLabels} />
      </div>

      {/* 리스트 */}
      {/* <h3 className="text-lg font-semibold mb-2">초진 환자 목록 ({date})</h3>
        <div className="mt-4">
          <Table
            headers={["번호", "이름", "유형", "유입"]}
            rows={filteredList.map((item: any) => [
              item.jubCham,
              item.chamWhanja,
              item.partName,
              item.chamMemo2,
            ])}
          />
        </div> */}
    </section>
  );
}
