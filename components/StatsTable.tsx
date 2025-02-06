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
        <th key={department}>{department}</th>
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
