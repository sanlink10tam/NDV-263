import React, { useState, useEffect } from 'react';
import { User, LoanRecord } from '../types';
import { 
  Activity, 
  Wallet, 
  TrendingUp, 
  Users, 
  ClipboardList, 
  LogOut, 
  ArrowUpRight, 
  Scale, 
  AlertCircle,
  Clock,
  ShieldAlert,
  RotateCcw,
  X,
  Check,
  Database
} from 'lucide-react';

interface AdminDashboardProps {
  user: User | null;
  loans: LoanRecord[];
  registeredUsersCount: number;
  systemBudget: number;
  rankProfit: number;
  onResetRankProfit: () => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, loans, registeredUsersCount, systemBudget, rankProfit, onResetRankProfit, onLogout }) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState<string>("CHECKING");

  useEffect(() => {
    const checkFirebase = async () => {
      try {
        const res = await fetch('/api/firebase-status');
        const data = await res.json();
        setFirebaseStatus(data.status);
      } catch (e) {
        setFirebaseStatus("ERROR");
      }
    };
    checkFirebase();
    const interval = setInterval(checkFirebase, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const settledLoans = loans.filter(l => l.status === 'ĐÃ TẤT TOÁN');
  const pendingLoans = loans.filter(l => l.status === 'CHỜ DUYỆT' || l.status === 'CHỜ TẤT TOÁN');
  
  const today = new Date();
  const overdueLoans = loans.filter(l => {
    if (l.status !== 'ĐANG NỢ' && l.status !== 'CHỜ TẤT TOÁN') return false;
    const [d, m, y] = l.date.split('/').map(Number);
    const dueDate = new Date(y, m - 1, d);
    return dueDate < today;
  });

  const profitFromFees = loans
    .filter(l => l.status === 'ĐÃ TẤT TOÁN')
    .reduce((acc, curr) => acc + (curr.amount * 0.15), 0);
    
  const totalFines = loans
    .filter(l => l.status === 'ĐÃ TẤT TOÁN')
    .reduce((acc, curr) => acc + (curr.fine || 0), 0);
    
  const totalProfit = profitFromFees + totalFines;

  const totalDisbursed = loans.filter(l => l.status !== 'BỊ TỪ CHỐI' && l.status !== 'CHỜ DUYỆT').reduce((acc, curr) => acc + curr.amount, 0);
  const totalCollected = settledLoans.reduce((acc, curr) => acc + curr.amount, 0);
  const activeDebt = totalDisbursed - totalCollected;

  const isBudgetAlarm = systemBudget <= 2000000;

  const handleConfirmReset = () => {
    onResetRankProfit();
    setShowResetConfirm(false);
  };

  return (
    <div className="w-full bg-[#0a0a0a] px-5 pb-32 space-y-6 pt-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center px-1 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#ff8c00] to-[#ff5f00] rounded-2xl flex items-center justify-center font-black text-black text-sm shadow-lg shadow-orange-500/20">
            NDV
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tighter uppercase leading-none">NDV Money Admin</h2>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">Hệ thống trực tuyến</span>
              </div>
              <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
                <Database size={10} className={
                  firebaseStatus === 'CONNECTED' ? 'text-blue-500' : 
                  firebaseStatus === 'LOCAL_ONLY' ? 'text-yellow-500' : 'text-red-500'
                } />
                <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${
                  firebaseStatus === 'CONNECTED' ? 'text-blue-500' : 
                  firebaseStatus === 'LOCAL_ONLY' ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {firebaseStatus === 'CONNECTED' ? 'Firebase: OK' : 
                   firebaseStatus === 'LOCAL_ONLY' ? 'Database: Local' : 
                   firebaseStatus === 'CHECKING' ? 'Database: Checking...' : 'Database: Error'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <button onClick={onLogout} className="w-11 h-11 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90">
          <LogOut size={20} />
        </button>
      </div>

      {isBudgetAlarm && (
        <div className="bg-red-600/10 border border-red-600/30 rounded-[2rem] p-5 flex flex-col items-center text-center gap-3 animate-pulse shadow-lg shadow-red-950/10">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
            <AlertCircle size={20} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-none mb-1.5">Ngân sách cạn kiệt</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Nguồn vốn khả dụng đang ở mức báo động (≤ 2.000.000 đ).</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111111] border border-white/5 rounded-[2rem] p-6 space-y-4 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
              <TrendingUp size={20} />
            </div>
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-gray-600 hover:text-[#ff8c00] active:scale-90 transition-all"
              title="Đặt lại thống kê"
            >
              <RotateCcw size={14} />
            </button>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Phí nâng hạng</p>
            <p className="text-lg font-black text-purple-500">{rankProfit.toLocaleString()} đ</p>
          </div>
        </div>
        <div className="bg-[#111111] border border-white/5 rounded-[2rem] p-6 space-y-4">
          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
            <ShieldAlert size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">HĐ Quá hạn</p>
            <p className="text-lg font-black text-red-500">{overdueLoans.length} HĐ</p>
          </div>
        </div>
      </div>

      <div className="bg-[#111111] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff8c00]/5 rounded-full blur-[60px] -mr-16 -mt-16"></div>
        <div className="space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Lợi nhuận từ Phí & Phạt</p>
              <h3 className="text-4xl font-black text-[#ff8c00] tracking-tighter">{totalProfit.toLocaleString()} <span className="text-lg">đ</span></h3>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <ArrowUpRight size={14} className="text-green-500" />
              <span className="text-[9px] font-black text-green-500 uppercase">Live Profit</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isBudgetAlarm ? 'bg-red-500/10 text-red-500' : 'bg-[#ff8c00]/10 text-[#ff8c00]'}`}>
                <Wallet size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Ngân sách hiện tại</p>
                <p className={`text-lg font-black tracking-tight ${isBudgetAlarm ? 'text-red-500' : 'text-white'}`}>{systemBudget.toLocaleString()} đ</p>
              </div>
            </div>
            <TrendingUp size={24} className="text-white/5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111111] border border-white/5 rounded-[2rem] p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
              <Users size={20} />
            </div>
            <span className="text-[8px] font-black text-gray-700 uppercase">Active</span>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Người dùng</p>
            <p className="text-2xl font-black text-white">{registeredUsersCount}</p>
          </div>
        </div>
        <div className="bg-[#111111] border border-white/5 rounded-[2rem] p-6 space-y-4 relative">
          <div className="flex justify-between items-center">
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
              <Clock size={20} />
            </div>
            {pendingLoans.length > 0 && <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>}
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Lệnh chờ duyệt</p>
            <p className="text-2xl font-black text-white">{pendingLoans.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#111111] border border-white/5 rounded-[2.5rem] p-8 space-y-8">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                <Scale size={20} />
              </div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Sức khỏe Dư nợ</h4>
           </div>
           <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full">
              <AlertCircle size={10} className="text-gray-600" />
              <span className="text-[7px] font-black text-gray-600 uppercase">Risk Monitor</span>
           </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-end px-1">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Tổng dư nợ thị trường</p>
              <p className="text-xl font-black text-red-500">{activeDebt.toLocaleString()} đ</p>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-red-500/60 transition-all duration-1000" style={{ width: `${Math.min(100, (activeDebt / (systemBudget + activeDebt || 1)) * 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#111111] border border-orange-500/20 w-full max-w-sm rounded-[2.5rem] p-8 space-y-8 relative shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-500"></div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500">
                 <RotateCcw size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">RESET THỐNG KÊ?</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed px-4">
                  Bạn có chắc chắn muốn đặt lại thống kê <span className="text-orange-500">Phí Nâng Hạng</span> về 0? Hành động này không ảnh hưởng đến số dư người dùng.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
               <button 
                 onClick={() => setShowResetConfirm(false)}
                 className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                 <X size={14} /> HỦY BỎ
               </button>
               <button 
                 onClick={handleConfirmReset}
                 className="flex-1 py-4 bg-orange-600 rounded-2xl text-[10px] font-black text-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-900/40"
               >
                 <Check size={14} /> ĐỒNG Ý
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;