import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

interface RadarData {
  difficulty: number;
  emotion: number;
  deduction: number;
  beginner: number;
  social: number;
}

interface RadarChartSmallProps {
  data: RadarData;
  size?: number;
}

const axisLabels = {
  difficulty: '难度',
  emotion: '情感',
  deduction: '推理',
  beginner: '新手',
  social: '社交',
};

export default function RadarChartSmall({
  data,
  size = 120,
}: RadarChartSmallProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    subject: axisLabels[key as keyof typeof axisLabels] || key,
    value: Math.max(0, Math.min(10, value)),
  }));

  return (
    <div
      style={{ width: size, height: size }}
      className="shrink-0"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} outerRadius="70%">
          <PolarGrid
            stroke="rgba(110, 94, 138, 0.3)"
            strokeWidth={1}
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={{
              fill: '#94a3b8',
              fontSize: 9,
              fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
            }}
          />
          <Radar
            name="属性"
            dataKey="value"
            stroke="#D4A84B"
            fill="#D4A84B"
            fillOpacity={0.25}
            strokeWidth={1.5}
            dot={{
              fill: '#D4A84B',
              stroke: '#D4A84B',
              strokeWidth: 1,
              r: 2,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
