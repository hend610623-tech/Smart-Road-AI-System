
import React, { useState, useEffect, useCallback } from 'react';
import { getCommandLogs } from '../services/geminiService';
import { LoaderIcon, InfoIcon, BoltIcon } from './Icons';

const OrderHistory: React.FC<{onNavigate?: any, onRemoteStart?: any}> = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await getCommandLogs();
      if (data && data.length > 0) {
        setRows(data);
      } else {
        setRows([]);
        if (!data) setErrorMsg("No response from script.");
      }
    } catch (e) {
      setErrorMsg("Failed to parse sheet data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    window.addEventListener('sheet-updated', fetchData);
    return () => window.removeEventListener('sheet-updated', fetchData);
  }, [fetchData]);

  const headers = ['A (Time)', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="h-full flex flex-col bg-[#121212] font-mono">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#1e1e1e]">
        <div className="flex items-center gap-2">
          <BoltIcon className="text-primary w-5 h-5" />
          <h2 className="text-xs font-bold uppercase tracking-widest">Live Spreadsheet Data</h2>
        </div>
        <button 
          onClick={fetchData}
          disabled={isLoading}
          className="bg-primary text-black px-4 py-1.5 rounded text-[10px] font-black uppercase active:scale-95 transition-transform"
        >
          {isLoading ? "Syncing..." : "Manual Refresh"}
        </button>
      </div>

      <div className="flex-grow overflow-auto">
        {isLoading && rows.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-50">
            <LoaderIcon className="w-8 h-8 mb-2 text-primary" />
            <span className="text-[10px] uppercase">Contacting Google Sheets...</span>
          </div>
        ) : errorMsg ? (
          <div className="h-full flex flex-col items-center justify-center text-red-400 p-4 text-center">
            <InfoIcon className="mb-2" />
            <p className="text-xs uppercase font-bold">{errorMsg}</p>
            <p className="text-[9px] mt-2 text-gray-500">Check your Apps Script Deployment Settings.</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-[#222] z-10 shadow-lg">
              <tr>
                <th className="p-3 text-left text-[9px] text-gray-500 border-b border-white/10 w-10">#</th>
                {headers.map(h => (
                  <th key={h} className="p-3 text-left text-[9px] text-primary font-bold border-b border-white/10 uppercase tracking-tighter">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row, idx) => {
                const cells = Array.isArray(row) ? row : Object.values(row);
                return (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 text-[10px] text-gray-600 border-r border-white/5">{idx + 1}</td>
                    {headers.map((_, colIdx) => (
                      <td key={colIdx} className="p-3 text-[10px] text-gray-300 border-r border-white/5 truncate max-w-[120px]">
                        {cells[colIdx] !== undefined ? String(cells[colIdx]) : ""}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
