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
  