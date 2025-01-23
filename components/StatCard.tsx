// import { Icon } from "next/dist/lib/metadata/types/metadata-types";
import React from "react";
import { IconType } from "react-icons";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: IconType;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, color }) => {
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg shadow-md ${
        color || "bg-white"
      } text-gray-800`}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
        {icon && React.createElement(icon)}
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
    </div>
  );
};

export default StatCard;