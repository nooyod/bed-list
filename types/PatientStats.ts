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
  