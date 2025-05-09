import React from "react";
import { PatientStats } from "@/types/PatientStats";
import Card from "@/components/StatCard";
import DonutChart from "@/components/PieChart";
import Table from "@/components/Table";
import LineChart from "@/components/LineChart2";
import { FaHospitalAlt, FaHospitalUser, FaUserCheck } from "react-icons/fa";

interface LeftSectionProps {
  stats: PatientStats | null;
  date: string;
}

export default function LeftSection({ stats, date }: LeftSectionProps) {
  if (!stats) {
    return <p>데이터를 불러오는 중입니다...</p>;
  }

  const selectedData = stats.outPatientStats.find((item) => item.date === date)
  const in_total = selectedData ? selectedData.in_total : 0;
  const in_total_ya = selectedData ? selectedData.in_total_ya : 0;
  const in_new = selectedData ? selectedData.in_new : 0;
  const in_first = selectedData ? selectedData.in_first : 0;
  const in_again = selectedData ? selectedData.in_again : 0;
  const in_total_0 = selectedData ? selectedData.in_total_0 : 0;
  const in_total_1 = selectedData ? selectedData.in_total_1 : 0;
  const in_total_2 = selectedData ? selectedData.in_total_2 : 0;
  const filteredList = selectedData ? selectedData.filteredList : [];

  const yesterdayData = stats?.outPatientStats.find((item) => item.date === (parseInt(date) - 1).toString());
  const in_total_yesterday = yesterdayData ? yesterdayData.in_total : 0;
  const difference = in_total - in_total_yesterday;
  const differenceText = difference === 0 ? "변동 없음" : difference > 0 ? `${difference}명 증가` : `${Math.abs(difference)}명 감소`;
  
  // 카드 데이터
  const outpatientCards = [
    { title: "총 외래", value: in_total, value_night: `(야간 ${in_total_ya})`, description:`총 외래 환자 수 [전일 대비 ${differenceText}]`, icon:FaHospitalAlt, color:"bg-blue-100" },
    { title: "재진", value: in_again, description: "재진 환자 수", icon: FaUserCheck, color: "bg-red-100" },
    { title: "신규", value: in_new, description: "신규 환자 수", icon: FaHospitalUser, color: "bg-green-100" },
    { title: "초진", value: in_first, description: "초진 환자 수", icon: FaUserCheck, color: "bg-yellow-100" },
  ];

  // 파이차트 데이터
  const pieLabels = ["건보", "산재", "자보"];
  const pieData = [
    in_total_0,
    in_total_1,
    in_total_2,
  ];

  return (
    <section className="left-section p-4 bg-gray-100 rounded-md">
      <h2 className="text-xl font-bold mb-4">외래 정보</h2>

      {/* 카드들 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {outpatientCards.map((card, index) => (
          <Card key={index} title={card.title} value={card.value} value_night={card.value_night} description={card.description} icon={card.icon} color={card.color}/>
        ))}
      </div>

      {/* 파이차트 */}
      <div className="mb-6">
        <DonutChart data={pieData} labels={pieLabels} />
      </div>

      <h2 className="text-xl font-bold mb-4">외래 추이</h2>
      <div className="mb-6"
      style={{ height: "250px", width: "710px", backgroundColor: "white" }}>
        <LineChart stats={stats} date={date} />
      </div>

      {/* 리스트 */}
      <h3 className="text-lg font-semibold mb-2">초진 환자 목록 </h3>
        <div className="mt-4">
          <Table
            headers={["번호", "이름", "유형", "유입"]}
            rows={filteredList.map((item: { jubCham: string; chamWhanja: string; partName: string; chamMemo2: string }) => [
              item.jubCham.slice(-5),
              item.chamWhanja.trim(),
              item.partName.trim(),
              item.chamMemo2.replace("/SMS거부","").replace("/sms거부",""),
            ])}
          />
        </div>
    </section>
  );
}
