// import { Icon } from "next/dist/lib/metadata/types/metadata-types";
import React from "react";
import { IconType } from "react-icons";

interface StatCardProps {
  title: string;
  value: string | number;
  value_night: string | number | undefined;
  description?: string;
  icon?: IconType;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, value_night, description, icon, color }) => {
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
        <p className="inline text-2xl font-bold mr-2">{value}</p>
        <p className="inline text-l text-gray-500t">{value_night}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
    </div>
  );
};

export default StatCard;