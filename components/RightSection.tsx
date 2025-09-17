import React from "react";
import { PatientStats } from "@/types/PatientStats";
import Card from "@/components/StatCard";
import DonutChart from "@/components/PieChart";
import BarChart from "@/components/BarChart";
import Table from "@/components/Table";
import { FaWheelchair, FaUserPlus, FaUserMinus } from "react-icons/fa";
import { insusubMap } from '@/lib/config';

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
  const filteredList = selectedData?.filteredList ?? { admitted: [], discharged: [] };

  const yesterdayData = stats?.inPatientStats.find((item) => item.date === (parseInt(date) - 1).toString());
  const totalinpatient_yesterday = yesterdayData ? yesterdayData.totalinpatient : 0;
  const difference = totalinpatient - totalinpatient_yesterday;
  const differenceText = difference === 0 ? "변동 없음" : difference > 0 ? `${difference}명 증가` : `${Math.abs(difference)}명 감소`;
  
  // 카드 데이터
  const inpatientCards = [
    { title: "현재", value: totalinpatient, description: `현재 입원 환자 수 [전일 대비 ${differenceText}]`, icon:FaWheelchair, color:"bg-blue-100" },
    { title: "", value: "", description: "", icon: undefined, color:"bg-gray-100" },
    { title: "입원", value: todayadm, description: "입원 환자 수", icon: FaUserPlus, color: "bg-green-100" },
    { title: "퇴원", value: todaydc, description: "퇴원 환자 수", icon: FaUserMinus, color: "bg-yellow-100" },
  ];

  // 파이차트 데이터
  const pieLabels = ["건보", "산재", "자보", "급여", "일반"];
  const pieData = [
    insurance00,
    insurance30,
    insurance20,
    insurance10,
    insurance50,
  ];

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

      {/* 라인차트 */}
      <h2 className="text-xl font-bold mb-4">입원 추이</h2>
      <div className="mb-6"
      style={{ height: "250px", width: "710px", backgroundColor: "white" }}>
        <BarChart stats={stats} date={date} />
      </div>

      {/* 리스트 */}
      {/* <h3 className="text-lg font-semibold mb-2">당일 입원/퇴원 목록</h3> */}
        {/* <div className="mt-4 grid grid-cols-2 gap-4"> */}
          {/* 좌측: 당일 입원자 목록 */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">입원 목록</h3>
            <Table
              headers={["병실", "번호", "이름", "유형", "유입"]}
              rows={(filteredList?.admitted ?? []).map((item) => [
                item.ROOM,
                item.CHARTNO.slice(-5),
                (item.PATNAME ?? "").trim(),
                insusubMap[item.INSUSUB.trim()],
                item.FUNNEL.replace("/SMS거부","").replace("/sms거부",""),
              ])}
            />
          </div>

          {/* 우측: 당일 퇴원자 목록 */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">퇴원 목록</h3>
            <Table
              headers={["병실", "번호", "이름", "유형", "유입"]}
              rows={(filteredList?.discharged ?? []).map((item) => [
                item.ROOM,
                item.CHARTNO.slice(-5),
                (item.PATNAME ?? "").trim(),
                insusubMap[item.INSUSUB.trim()],
                item.FUNNEL.replace("/SMS거부","").replace("/sms거부",""),
              ])}
            />
          </div>
        {/* </div> */}
    </section>
  );
}
