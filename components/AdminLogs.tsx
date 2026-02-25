
import React from 'react';
import { 
  Shield, 
  Smartphone, 
  Clock, 
  ShieldCheck, 
  ChevronLeft 
} from 'lucide-react';
import { LogEntry } from '../types';

interface AdminLogsProps {
  logs: LogEntry[];
  onBack: () => void;
}

const AdminLogs: React.FC<AdminLogsProps> = ({ logs, onBack }) => {
  return (
    <div className="w-full bg-black min-h-screen px-5 pb-32 animate-in fade-in duration-500">
      <div className="flex items-center justify-between pt-10 mb-8 px-1">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-[#111111] border border-white/5 rounded-full flex items-center justify-center text-white active:scale-90"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
            NHẬT KÝ HỆ THỐNG
          </h1>
        </div>
        <button className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 shadow-lg shadow-blue-500/10 active:scale-95 transition-all">
          <Shield size={24} />
        </button>
      </div>

      <div className="bg-[#111111] border border-white/5 rounded-[2.5rem] overflow-hidden">
        {logs.length === 0 ? (
          <div className="py-32 text-center">
            <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">Hệ thống chưa ghi nhận nhật ký</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <div 
              key={log.id} 
              className={`p-8 space-y-4 transition-colors hover:bg-white/[0.01] ${index !== logs.length - 1 ? 'border-b border-white/5' : ''}`}
            >
              <div className="flex justify-between items-start">
                <h3 className={`text-base font-black uppercase tracking-tight leading-none ${log.user === 'ADMIN' ? 'text-[#ff8c00]' : 'text-blue-500'}`}>{log.user}</h3>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Clock size={12} className="opacity-60" />
                  <span className="text-[10px] font-bold opacity-80">{log.time}</span>
                </div>
              </div>
              <p className="text-sm font-bold text-white tracking-tight leading-none">{log.action}</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
                <div className="flex items-center gap-2 text-gray-500">
                  <ShieldCheck size={14} className="opacity-30" />
                  <span className="text-[9px] font-black uppercase tracking-widest">IP: {log.ip}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Smartphone size={14} className="opacity-30" />
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-80">{log.device}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {logs.length > 0 && (
        <p className="text-center text-[8px] font-black text-gray-700 uppercase tracking-[0.2em] mt-8">
          Hiển thị {logs.length} nhật ký gần nhất
        </p>
      )}
    </div>
  );
};

export default AdminLogs;
