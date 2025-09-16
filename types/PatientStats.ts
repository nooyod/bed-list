interface FilteredPatient {
  CHARTNO: string;
  PATNAME: string;
  INDAT: string;
  OUTDAT: string;
  OUTKIND: string;   // string 으로 변경
}

export interface PatientStats {
    inPatientStats: {
      date: string;
      totalinpatient: number;
      todayadm: number;
      todaydc: number;
      insurance00: number;
      insurance10: number;
      insurance20: number;
      insurance30: number;
      insurance50: number;
      filteredList: {
        admitted: FilteredPatient[];   // 당일 입원자 목록
        discharged: FilteredPatient[]; // 당일 퇴원자 목록
  };
    }[];
    outPatientStats: {
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
    }[];
  }
  