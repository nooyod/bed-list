import React from "react";
import { PatientStats } from "@/types/PatientStats";
import Card from "@/components/StatCard";
import DonutChart from "@/components/PieChart";
import { FaWheelchair, FaUserPlus, FaUserMinus } from "react-icons/fa";

interface RightSectionProps {
  stats: PatientStats | null;
  date: string;
}

export default function RightSection({ stats, date }: RightSectionProps) {
  if (!stats) {
    return <p>데이터를 불러오는 중입니다...</p>;
  }
  
  const selectedData = stats.inPatientStats.find((item) => item.date === date)
  const totalinpatient = selectedData ? selectedData.totalinpatient : 0;
  const todayadm = selectedData ? selectedData.todayadm : 0;
  const todaydc = selectedData ? selectedData.todaydc : 0;
  const insurance00 = selectedData ? selectedData.insurance00 : 0;
  const insurance10 = selectedData ? selectedData.insurance10 : 0;
  const insurance20 = selectedData ? selectedData.insurance20 : 0;
  const insurance30 = selectedData ? selectedData.insurance30 : 0;
  const insurance50 = selectedData ? selectedData.insurance50 : 0;
  
  // 카드 데이터
  const inpatientCards = [
    { title: "현재 입원", value: totalinpatient, description:"현재 입원 환자 수", icon:FaWheelchair, color:"bg-blue-100" },
    { title: "", value: "", description: "", icon: undefined, color:"bg-gray-100" },
    { title: "오늘 입원", value: todayadm, description: "오늘 입원 환자 수", icon: FaUserPlus, color: "bg-green-100" },
    { title: "오늘 퇴원", value: todaydc, description: "오늘 퇴원 환자 수", icon: FaUserMinus, color: "bg-red-100" },
  ];

  // 파이차트 데이터
  const pieLabels = ["건보", "급여", "자보", "산재", "일반"];
  const pieData = [
    insurance00,
    insurance10,
    insurance20,
    insurance30,
    insurance50,
  ];

//   const filteredList = stats.jubStats.filteredList;

  return (
    <section className="left-section p-4 bg-gray-100 rounded-md">
      <h2 className="text-xl font-bold mb-4">입원 정보</h2>

      {/* 카드들 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {inpatientCards.map((card, index) => (
          <Card key={index} title={card.title} value={card.value} description={card.description} icon={card.icon} color={card.color}/>
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
