import { FiInbox } from 'react-icons/fi'

export default function DataTable({ columns, data, onRowClick, emptyMessage = 'No data available', showIndex = false }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-10 text-center">
        <div className="w-14 h-14 bg-[#1a1a24] rounded-xl flex items-center justify-center mx-auto mb-4">
          <FiInbox className="w-7 h-7 text-slate-600" />
        </div>
        <p className="text-slate-400 font-medium">{emptyMessage}</p>
        <p className="text-slate-600 text-sm mt-1">Data will appear here once available</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e1e2e]">
              {showIndex && (
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">#</th>
              )}
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  className={`px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e2e]">
            {data.map((row, index) => (
              <tr 
                key={row._id || index}
                onClick={() => onRowClick && onRowClick(row)}
                className={`
                  transition-all duration-150 hover:bg-[#1a1a24]/50
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
              >
                {showIndex && (
                  <td className="px-5 py-3 whitespace-nowrap text-sm text-slate-600">{index + 1}</td>
                )}
                {columns.map((col) => (
                  <td 
                    key={col.key} 
                    className={`px-5 py-3 whitespace-nowrap text-sm text-slate-300 ${col.className || ''}`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Table Footer */}
      <div className="px-6 py-3 border-t border-slate-800/30 bg-slate-900/30">
        <p className="text-xs text-slate-500">
          Showing <span className="font-medium text-slate-400">{data.length}</span> {data.length === 1 ? 'item' : 'items'}
        </p>
      </div>
    </div>
  )
}
