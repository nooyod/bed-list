export interface PatientStats {
    silverStats: {
      totalinpatient: number;
      todayadm: number;
      todaydc: number;
      insurance0: number;
      insurance1: number;
      insurance2: number;
      insurance3: number;
      insurance5: number;
    };
    jubStats: {
      in_total: number;
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
    };
  }
  