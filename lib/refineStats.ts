interface JubData {
    jubCham: string;
    jubChoJae: number;
    jubTprt: number;
    jubJuya: number;
    chamWhanja: string;
    partName: string;
    chamMemo2: string;
    partkey: number;
  }
    
  interface RawInpatientData {
    CHARTNO: number;   // 환자 번호
    PATNAME: string;   // 환자 이름
    INDAT: string;  // 입원 날짜 (yyyymmdd 형식)
    OUTDAT: string; // 퇴원 날짜 (yyyymmdd 형식 또는 공백)
    INSUCLS: string; // 보험 코드
    OUTKIND: string; // 입원 종류 (e.g., "99" for 입원)
    FUNNEL: string;
    ROOM: string;
    INSUSUB: string;
  }

  interface FilteredPatient {
  CHARTNO: number;
  PATNAME: string;
  INDAT: string;
  OUTDAT: string;
  OUTKIND: string;
  INSUSUB: string;
  FUNNEL: string;
  ROOM: string;
}
  
  interface InpatientStats {
    date: string; // 날짜 (yyyymmdd 형식)
    totalinpatient: number; // 현재 입원 환자 수
    todayadm: number; // 오늘 입원한 환자 수
    todaydc: number; // 오늘 퇴원한 환자 수
    insurance00: number; // 보험 종류 0
    insurance10: number; // 보험 종류 1
    insurance20: number; // 보험 종류 2
    insurance30: number; // 보험 종류 3
    insurance50: number; // 보험 종류 5
    filteredList: {
    admitted: FilteredPatient[]; // 당일 입원자 목록
    discharged: FilteredPatient[]; // 당일 퇴원자 목록
    };
  }
  
  export const refineInpatientData = (
    rawData: RawInpatientData[], 
    startDate: string, 
    endDate: string
  ): InpatientStats[] => {
    const start = new Date(
      parseInt(startDate.slice(0, 4)), 
      parseInt(startDate.slice(4, 6)) - 1, 
      parseInt(startDate.slice(6, 8))
    );
    const end = new Date(
      parseInt(endDate.slice(0, 4)), 
      parseInt(endDate.slice(4, 6)) - 1, 
      parseInt(endDate.slice(6, 8))
    );
    // Helper function to format date to yyyymmdd
    const formatDate = (date: Date) =>
      date.toISOString().slice(0, 10).replace(/-/g, "");
  
    const stats: InpatientStats[] = [];
  
    // Iterate over each date in the range
    for (let d = new Date(end); d >= start; d.setDate(d.getDate() - 1)) {
      const currentDate = formatDate(d);
      // Filter and calculate data for the current date
      const filteredData = rawData.filter(item =>
        item.INDAT <= currentDate &&
        (item.OUTDAT > currentDate || item.OUTDAT.trim() === "")
      );
      
      const admittedList = rawData.filter((item) => item.INDAT === currentDate);
      const dischargedList = rawData.filter((item) => item.OUTDAT === currentDate);

      const todayAdm = rawData.filter(item => item.INDAT === currentDate).length;
      const todayDc = rawData.filter(item => item.OUTDAT === currentDate).length;

      const insuranceCounts = filteredData.reduce(
        (acc, item) => {
          // INSUCLS 값을 기반으로 키 생성 (문자열 그대로 사용)
          const key = `insurance${item.INSUCLS}`;
          if (key in acc) {
            acc[key] += 1; // 해당 키의 값을 1 증가
          }
          return acc;
        },
        {
          insurance00: 0,
          insurance10: 0,
          insurance20: 0,
          insurance30: 0,
          insurance50: 0,
        } as Record<string, number>
      );
  
      stats.push({
        date: String(parseInt(currentDate)),
        totalinpatient: filteredData.length,
        todayadm: todayAdm,
        todaydc: todayDc,
        insurance00: insuranceCounts.insurance00,
        insurance10: insuranceCounts.insurance10,
        insurance20: insuranceCounts.insurance20,
        insurance30: insuranceCounts.insurance30,
        insurance50: insuranceCounts.insurance50,
        filteredList: {
          admitted: admittedList.map((p) => ({
            CHARTNO: p.CHARTNO,
            PATNAME: p.PATNAME,
            INDAT: p.INDAT,
            OUTDAT: p.OUTDAT,
            OUTKIND: p.OUTKIND,
            INSUSUB: p.INSUSUB,
            FUNNEL: p.FUNNEL,
            ROOM: p.ROOM,
          })),
          discharged: dischargedList.map((p) => ({
            CHARTNO: p.CHARTNO,
            PATNAME: p.PATNAME,
            INDAT: p.INDAT,
            OUTDAT: p.OUTDAT,
            OUTKIND: p.OUTKIND,
            INSUSUB: p.INSUSUB,
            FUNNEL: p.FUNNEL,
            ROOM: p.ROOM,
          })),
        },
      });
    }

  
    return stats;
  };
  
  export const refineOutpatientData = (
    outpatientData: (JubData & { jubDate: string })[]
  ): {
    date: string;
    in_total: number;
    in_total_ya: number;
    in_new: number;
    in_first: number;
    in_again: number;
    in_total_0: number;
    in_total_1: number;
    in_total_2: number;
    in_total_3: number;
    in_total_4: number;
    filteredList: {
      jubCham: string;
      jubChoJae: number;
      chamWhanja: string;
      partName: string;
      jubTprt: number;
      chamMemo2: string;
    }[];
  }[] => {
    // 날짜별로 데이터를 그룹화 (jubDate 기준)
    const groupedByDate: { [key: string]: JubData[] } = outpatientData.reduce(
      (acc, row) => {
        const date = row.jubDate; // 날짜 필드 사용
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(row);
        return acc;
      },
      {} as { [key: string]: JubData[] }
    );
  
    // 날짜별로 refineJubData와 동일한 구조로 변환
    return Object.entries(groupedByDate).map(([date, data]) => {
      const uniqueData = (rows: JubData[], filter?: (row: JubData) => boolean) => {
        const filteredRows = filter ? rows.filter(filter) : rows;
        return Array.from(new Map(filteredRows.map((row) => [row.jubCham, row])).values());
      };
  
      return {
        date, // 날짜 추가
        in_total: uniqueData(data).length,
        in_total_ya: uniqueData(data, (row) => row.jubJuya === 1).length,
        in_new: uniqueData(data, (row) => row.jubChoJae === 0).length,
        in_first: uniqueData(data, (row) => row.jubChoJae === 1).length,
        in_again: uniqueData(data, (row) =>
          [2, 3, 4, 5].includes(row.jubChoJae)
        ).length,
        in_total_0: uniqueData(data, (row) => row.partkey === 4).length,
        in_total_1: uniqueData(data, (row) => row.partkey === 6 || row.partkey === 61 || row.partkey === 62).length,
        in_total_2: uniqueData(data, (row) => row.partkey === 7 || row.partkey === 71).length,
        in_total_3: uniqueData(data, (row) => row.partkey === 5 || row.partkey === 3).length,
        in_total_4: uniqueData(data, (row) => row.partkey === 1 || row.partkey === 2 || row.partkey === 8 || row.partkey === 9).length,
        filteredList: uniqueData(
          data,
          (row) => row.jubChoJae === 0 || row.jubChoJae === 1
        ).map((row) => ({
          jubCham: row.jubCham,
          jubChoJae: row.jubChoJae, // ✅ 누락된 필드 추가
          chamWhanja: row.chamWhanja,
          partName: row.partName,
          jubTprt: row.jubTprt,
          chamMemo2: row.chamMemo2,
          partkey: row.partkey,
        })),
      };
    });
  };
  