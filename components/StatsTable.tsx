import React from "react";

interface StatsTableProps {
  data: Record<string, number>;
}

const StatsTable: React.FC<StatsTableProps> = ({ data }) => {
  return (
    <table className="stats-table">
  <thead>
    <tr>
      {/* <th>과</th> */}
      {Object.keys(data).map((department) => (
        <th key={department}
        // style={{ backgroundColor: ["#16A34A", "#DC2626", "#CA8A04", "#2563EB", "#7C3AED "][index % 5],
        // color: "white",
        // fontWeight: "semibold",
        //  }}
         >
          {department}
         </th>
      ))}
    </tr>
  </thead>
  <tbody>
    <tr>
      {/* <td>수</td> */}
      {Object.values(data).map((count, index) => (
        <td key={index}>{count}</td>
      ))}
    </tr>
  </tbody>
    </table>
  );
};

export default StatsTable;
