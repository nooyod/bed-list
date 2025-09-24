export interface InSalesStat {
  date: string;   // YYYY-MM-DD
  inSales: number;
}

/**
 * 외래 매출 통계 (Wosum 기반)
 */
export interface OutSalesStat {
  date: string;   // YYYY-MM-DD
  outSales: number;
}


// 필요시 공용 타입
export interface SalesStats<T> {
  salesStats: T[];
}