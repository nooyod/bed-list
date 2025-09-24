import { InSalesStat, OutSalesStat, SalesStats } from "./SalesStats";

// export interface FilteredPatient {
//   CHARTNO: string;
//   PATNAME: string;
//   INDAT: string;
//   OUTDAT: string;
//   OUTKIND: string;   // string 으로 변경
//   INSUSUB: string;
//   FUNNEL: string;
//   ROOM: string;
// }

// export interface PatientStats {
//     inPatientStats: {
//       date: string;
//       totalinpatient: number;
//       todayadm: number;
//       todaydc: number;
//       insurance00: number;
//       insurance10: number;
//       insurance20: number;
//       insurance30: number;
//       insurance50: number;
//       filteredList: {
//         admitted: FilteredPatient[];   // 당일 입원자 목록
//         discharged: FilteredPatient[]; // 당일 퇴원자 목록
//       };
//     }[];
//     outPatientStats: {
//       date: string;
//       in_total: number;
//       in_total_ya: number;
//       in_new: number;
//       in_first: number;
//       in_again: number;
//       in_total_0: number;
//       in_total_1: number;
//       in_total_2: number;
//       in_total_3: number;
//       in_total_4: number;
//       filteredList: {
//         jubCham: string;
//         jubChoJae: number;
//         chamWhanja: string;
//         partName: string;
//         jubTprt: number;
//         chamMemo2: string;
//       }[];
//     }[];
//     salesStats: {
//       date: string;
//       outSales: number;
//       inSales: number;
//     }
//   }

export interface FilteredPatient {
  CHARTNO: string;
  PATNAME: string;
  INDAT: string;
  OUTDAT: string;
  OUTKIND: string;
  INSUSUB: string;
  FUNNEL: string;
  ROOM: string;
}

export interface InPatientStat {
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
    admitted: FilteredPatient[];
    discharged: FilteredPatient[];
  };
}

export interface OutPatientFiltered {
  jubCham: string;
  jubChoJae: number;
  chamWhanja: string;
  partName: string;
  jubTprt: number;
  chamMemo2: string;
  partkey?: number;
}

export interface OutPatientStat {
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
  filteredList: OutPatientFiltered[];
}

export interface PatientStats {
  inPatientStats: InPatientStat[];
  outPatientStats: OutPatientStat[];
  inSalesStats: SalesStats<InSalesStat>;      // SalesStats.ts의 타입 재사용
  outSalesStats: SalesStats<OutSalesStat>;    // SalesStats.ts의 타입 재사용
}
