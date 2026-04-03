import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

export default function StatCard({ title, value, icon: Icon, color, change, subtitle }) {
  const colorClasses = {
    blue: { accent: 'border-indigo-500', icon: 'bg-indigo-500/10 text-indigo-400' },
    green: { accent: 'border-emerald-500', icon: 'bg-emerald-500/10 text-emerald-400' },
    purple: { accent: 'border-violet-500', icon: 'bg-violet-500/10 text-violet-400' },
    orange: { accent: 'border-amber-500', icon: 'bg-amber-500/10 text-amber-400' },
    pink: { accent: 'border-pink-500', icon: 'bg-pink-500/10 text-pink-400' },
    cyan: { accent: 'border-cyan-500', icon: 'bg-cyan-500/10 text-cyan-400' },
    indigo: { accent: 'border-indigo-500', icon: 'bg-indigo-500/10 text-indigo-400' },
  }

  const colors = colorClasses[color] || colorClasses.blue

  return (
    <div className={`bg-[#12121a] border border-[#1e1e2e] rounded-xl p-5 hover:border-[#2a2a3a] transition-all duration-200`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-slate-600 text-xs mt-1">{subtitle}</p>
          )}
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {change >= 0 ? <FiTrendingUp className="w-3.5 h-3.5" /> : <FiTrendingDown className="w-3.5 h-3.5" />}
              <span>{change >= 0 ? '+' : ''}{change}%</span>
              <span className="text-slate-600 font-normal text-xs">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${colors.icon} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
