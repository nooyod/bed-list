interface JubData {
    jubCham: string;
    jubChoJae: number;
    jubTprt: number;
    chamWhanja: string;
    partName: string;
    chamMemo2: string;
  }
  
  export const refineJubData = (jubData: JubData[]) => {
    const uniqueData = (rows: JubData[], filter?: (row: JubData) => boolean) => {
      const filteredRows = filter ? rows.filter(filter) : rows;
      return Array.from(new Map(filteredRows.map((row) => [row.jubCham, row])).values());
    };
  
    return {
      in_total: uniqueData(jubData).length,
      in_new: uniqueData(jubData, (row) => row.jubChoJae === 0).length,
      in_first: uniqueData(jubData, (row) => row.jubChoJae === 1).length,
      in_again: uniqueData(jubData, (row) =>
        [2, 3, 4, 5].includes(row.jubChoJae)
      ).length,
      in_total_0: uniqueData(jubData, (row) => row.jubTprt === 0).length,
      in_total_1: uniqueData(jubData, (row) => row.jubTprt === 1).length,
      in_total_2: uniqueData(jubData, (row) => row.jubTprt === 2).length,
      filteredList: uniqueData(
        jubData,
        (row) => row.jubChoJae === 0 || row.jubChoJae === 1
      ).map((row) => ({
        jubCham: row.jubCham,
        chamWhanja: row.chamWhanja,
        partName: row.partName,
        jubTprt: row.jubTprt,
        chamMemo2: row.chamMemo2,
      })),
    };
  };
  
  interface RawInpatientData {
    INDAT: string;  // 입원 날짜 (yyyymmdd 형식)
    OUTDAT: string; // 퇴원 날짜 (yyyymmdd 형식 또는 공백)
    INSUCLS: string; // 보험 코드
    OUTKIND: string; // 입원 종류 (e.g., "99" for 입원)
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
      });
    }
  
    return stats;
  };
  
  function generateDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    let currentDate = new Date(startDate);
  
    while (currentDate <= new Date(endDate)) {
      dates.push(currentDate.toISOString().split("T")[0].replace(/-/g, ""));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }

  export function refineOutpatientData(
    outPatientData: any[],
    startDate: string,
    date: string
  ) {

    // 날짜별 데이터를 저장할 객체 초기화
    const refinedData: { date: string; in_total: number; in_new: number; in_first: number; in_again: number; in_total_0: number; in_total_1: number; in_total_2: number; filteredList: any[] }[] = [];
  
    // startDate부터 date까지의 날짜 목록 생성
    const dateList = generateDateRange(startDate, date);
  
    // 날짜별 데이터를 매핑
    dateList.forEach((currentDate) => {
      const dailyData = outPatientData.find((item) => item.date === currentDate);
  
      refinedData.push({
        date: currentDate,
        in_total: dailyData?.in_total || 0,
        in_new: dailyData?.in_new || 0,
        in_first: dailyData?.in_first || 0,
        in_again: dailyData?.in_again || 0,
        in_total_0: dailyData?.in_total_0 || 0,
        in_total_1: dailyData?.in_total_1 || 0,
        in_total_2: dailyData?.in_total_2 || 0,
        filteredList: dailyData?.filteredList || [],
      });
    });
  
    return refinedData;
  }
  