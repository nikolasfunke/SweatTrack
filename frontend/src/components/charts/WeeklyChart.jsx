import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

// day_num from MySQL DAYOFWEEK: 1=Sun, 2=Mon … 7=Sat
const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const EMPTY_WEEK = DAY_LABELS.map((day) => ({ day, load: 0 }));

// Convert backend weeklyData rows to { day, load } (load = 0-100 normalized sweat rate)
function buildChartData(weeklyData) {
  if (!weeklyData?.length) return EMPTY_WEEK;
  const maxRate = Math.max(...weeklyData.map((r) => r.avg_sweat_rate || 0));
  const byDayNum = Object.fromEntries(weeklyData.map((r) => [r.day_num, r]));
  // day_num 2=Mon … 7=Sat, 1=Sun — reorder to Mon-Sun for display
  const order = [2, 3, 4, 5, 6, 7, 1];
  return order.map((dn) => {
    const row = byDayNum[dn];
    const load = row && maxRate > 0 ? Math.round((row.avg_sweat_rate / maxRate) * 100) : 0;
    return { day: DAY_LABELS[dn - 1], load, dayNum: dn };
  });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs">
      <p className="font-bold text-white">{label}</p>
      <p className="text-white/60">{payload[0].value}% carga</p>
    </div>
  );
}

export default function WeeklyChart({ weeklyData }) {
  const data = buildChartData(weeklyData);
  // today's day_num in MySQL convention (1=Sun … 7=Sat)
  const todayDayNum = new Date().getDay() + 1;
  const { dark } = useTheme();
  const tickColor = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
  const emptyFill = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <div className="w-full h-28">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={16} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <XAxis
            dataKey="day"
            tick={{ fill: tickColor, fontSize: 10, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar dataKey="load" radius={[6, 6, 4, 4]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.load > 0 ? (entry.dayNum === todayDayNum ? '#C41E3A' : 'rgba(196,30,58,0.35)') : emptyFill}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
