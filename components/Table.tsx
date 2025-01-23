import React from "react";

interface TableProps {
  headers: string[];
  rows: string[][];
}

export default function Table({ headers, rows }: TableProps) {
  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead className="bg-gray-100">
        <tr>
          {headers.map((header, index) => (
            <th key={index} className="border border-gray-300 px-4 py-2">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
      {rows.length > 0 ? (
        rows.map((row, index) => (
          <tr key={index}>
            {row.map((cell, idx) => (
              <td key={idx} className="border border-gray-300 px-4 py-2">
                {cell}
              </td>
            ))}
          </tr>
        ))
    ) : (
        <tr>
          <td
            className="border border-gray-300 px-4 py-2 text-center"
            colSpan={4}
          >
            선택된 날짜에 해당하는 데이터가 없습니다.
          </td>
        </tr>
      )}
      </tbody>
    </table>
  );
}
