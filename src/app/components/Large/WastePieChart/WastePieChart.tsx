"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type PieDataEntry = {
  name: string;
  value: number;
};

interface WastePieChartProps {
  data: PieDataEntry[];
  loading: boolean;
  colors: string[];
}

const WastePieChart = ({ data, loading, colors }: WastePieChartProps) => {
  if (loading || !data || data.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%', 
        minHeight: '200px',
        color: 'var(--color-light-gray)',
        fontSize: '0.9rem',
        textAlign: 'center'
      }}>
        <p>{loading ? "Memuat data..." : "Data tidak tersedia untuk rentang waktu yang dipilih."}</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="70%" minWidth={200} minHeight={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="70%"
          dataKey="value"
          paddingAngle={5}
        >
          {data.map((_entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
              strokeWidth={0}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          formatter={(value: any, name: any) => [
            `${typeof value === 'number' ? value.toFixed(2) : value} kg`,
            name,
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default WastePieChart;