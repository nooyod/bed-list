"use client";

import { useState, useEffect } from "react";
import TopSection from "@/components/TopSection";
import LeftSection from "@/components/LeftSection";
import RightSection from "@/components/RightSection";
import { PatientStats } from "@/types/PatientStats";

export default function PatientPage() {
    const [date, setDate] = useState<string>(() => {
      const today = new Date();
      return today.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    });
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [, setLoading] = useState(false);

  const fetchStats = async (selectedDate: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/patient?date=${selectedDate}`);
      if (!response.ok) {
        throw new Error("데이터를 가져오는 데 실패했습니다.");
      }
      const data: PatientStats = await response.json();
      setStats(data);
    } catch (error) {
      console.error("데이터 가져오기 오류:", error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(date);
  }, [date]);
 
  return (
    <div className="container mx-auto p-4">
       <TopSection selectedDate={date} onDateChange={setDate} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <LeftSection date={date} stats={stats} />
        <RightSection date={date} stats={stats} />
      </div>
    </div>
  );
}

