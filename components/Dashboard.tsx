
import React, { useState, useMemo } from 'react';
import { User, UserRank, LoanRecord, Notification } from '../types';
import { TrendingUp, CreditCard, History, FileText, CalendarDays, Star, Activity, AlertCircle, ChevronRight, Eye, Bell } from 'lucide-react';
import NotificationModal from './NotificationModal';

interface DashboardProps {
  user: User | null;
  loans: LoanRecord[];
  notifications: Notification[];
  systemBudget: number;
  onApply: () => void;
  onLogout: () => void;
  onViewAllLoans: () => void;
  onSettleLoan?: (loan: LoanRecord) => void;
  onViewContract?: (loan: LoanRecord) => void;
  onMarkNotificationRead?: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  loans, 
  notifications,
  systemBudget, 
  onApply, 
  onLogout, 
  onViewAllLoans, 
  onSettleLoan, 
  onViewContract,
  onMarkNotificationRead
}) => {
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNextPaymentDate = () => {
    const now = new Date();
    const nextMonth1st = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const diffTime = nextMonth1st.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let finalDate;
    if (diffDays < 10) {
      finalDate = new Date(now.getFullYear(), now.getMonth() + 2, 1);
    } else {
      finalDate = nextMonth1st;
    }
    return finalDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const activeLoans = loans.filter(l => l.status === 'ĐANG ĐỐI SOÁT' || l.status === 'ĐANG NỢ' || l.status === 'ĐANG GIẢI NGÂN' || l.status === 'CHỜ DUYỆT');
  const earliestLoan = activeLoans.length > 0 ? [...activeLoans].sort((a, b) => {
    const [da, ma, ya] = a.date.split('/').map(Number);
    const [db, mb, yb] = b.date.split('/').map(Number);
    return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
  })[0] : null;

  const nextDueDate = getNextPaymentDate();
  const displayDueDate = earliestLoan ? earliestLoan.date : nextDueDate;

  const currentDebt = loans
    .filter(l => l.status === 'ĐANG NỢ' || l.status === 'CHỜ TẤT TOÁN')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const today = new Date();
  const hasOverdue = loans.some(l => {
    if (l.status !== 'ĐANG NỢ' && l.status !== 'CHỜ TẤT TOÁN' && l.status !== 'ĐANG GIẢI NGÂN') return false;
    const [d, m, y] = l.date.split('/').map(Number);
    const dueDate = new Date(y, m - 1, d);
    return dueDate < today;
  });

  const getRankInfo = (rank: UserRank = 'standard') => {
    switch (rank) {
      case 'bronze': return { name: 'ĐỒNG', color: 'bg-[#cd7f32]', textColor: 'text-black' };
      case 'silver': return { name: 'BẠC', color: 'bg-gray-300', textColor: 'text-black' };
      case 'gold': return { name: 'VÀNG', color: 'bg-yellow-400', textColor: 'text-black' };
      case 'diamond': return { name: 'KIM CƯƠNG', color: 'bg-[#ff8c00]', textColor: 'text-black' };
      default: return { name: 'TIÊU CHUẨN', color: 'bg-gray-600', textColor: 'text-white' };
    }
  };

  const getStatusStyles = (status: string, isOverdue: boolean) => {
    if (isOverdue) return 'text-red-500';
    switch (status) {
      case 'CHỜ DUYỆT': return 'text-orange-500';
      case 'ĐÃ DUYỆT': return 'text-blue-500';
      case 'ĐANG GIẢI NGÂN': return 'text-cyan-500';
      case 'ĐANG NỢ': return 'text-orange-600';
      case 'CHỜ TẤT TOÁN': return 'text-indigo-500';
      case 'ĐÃ TẤT TOÁN': return 'text-green-500';
      case 'BỊ TỪ CHỐI': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  const sortedLoans = useMemo(() => {
    return [...loans].sort((a, b) => {
      const parseCreatedAt = (str: string) => {
        try {
          const [time, date] = str.split(' ');
          const [h, m, s] = time.split(':').map(Number);
          const [d, mo, y] = date.split('/').map(Number);
          return new Date(y, mo - 1, d, h, m, s).getTime();
        } catch (e) {
          return 0;
        }
      };
      return parseCreatedAt(b.createdAt) - parseCreatedAt(a.createdAt);
    });
  }, [loans]);

  const rankInfo = getRankInfo(user?.rank);
  const displayedLoans = showAllHistory ? sortedLoans : sortedLoans.slice(0, 5);
  const isBudgetLow = systemBudget < 5000000;

  return (
    <div className="w-full bg-black px-5 pb-24 space-y-5 pt-4">
      <div className="flex justify-between items-center px-1 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#ff8c00] rounded-lg flex items-center justify-center font-black text-black text-[10px]">NDV</div>
          <h1 className="text-lg font-black text-white tracking-widest uppercase">Money</h1>
        </div>
        <button 
          onClick={() => setShowNotifications(true)}
          className="w-10 h-10 bg-[#111111] border border-white/5 rounded-full flex items-center justify-center text-gray-400 relative active:scale-90 transition-all"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <div className="absolute top-0 right-0 w-4 h-4 bg-red-600 rounded-full border-2 border-black flex items-center justify-center">
              <span className="text-[8px] font-black text-white">{unreadCount}</span>
            </div>
          )}
        </button>
      </div>

      <div className={`w-full ${rankInfo.color} rounded-[2.5rem] p-8 ${rankInfo.textColor} relative overflow-hidden shadow-2xl`}>
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Thành viên hạng</p>
              <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">{rankInfo.name}</h2>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[8px] font-black uppercase opacity-60 tracking-widest">Tiến trình Nâng Hạng</span>
              <div className="flex items-center gap-1.5 bg-black/10 px-3 py-1.5 rounded-full border border-black/5">
                <Star size={12} className="fill-current" />
                <span className="text-[10px] font-black uppercase">
                  {user?.rank === 'diamond' ? '10/10' : `${user?.rankProgress || 0}/10`} ĐIỂM
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-auto">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Chủ tài khoản</p>
            <p className="text-xl font-black tracking-tight truncate">{user?.fullName || 'CHƯA CẬP NHẬT'}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Hạn mức khả dụng</p>
            <p className="text-xl font-black tracking-tight">{(user?.balance || 0).toLocaleString()} đ</p>
          </div>
        </div>
      </div>

      <div className={`bg-[#111111] border rounded-[2.5rem] overflow-hidden transition-all ${isBudgetLow ? 'border-orange-500/30 ring-1 ring-orange-500/10' : 'border-white/5'}`}>
        <div className="p-6 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isBudgetLow ? 'bg-orange-500/10' : 'bg-green-500/10'}`}>
              <Activity className={isBudgetLow ? 'text-orange-500' : 'text-green-500'} size={20} />
            </div>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${isBudgetLow ? 'text-orange-500' : 'text-green-500'}`}>
                {isBudgetLow ? 'Nguồn vốn hạn chế' : 'Nguồn vốn hệ thống'}
              </p>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isBudgetLow ? 'bg-orange-500 shadow-[0_0_8px_rgba(255,140,0,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`}></div>
                <p className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter">Live security V1.26</p>
              </div>
            </div>
          </div>
          <p className={`text-xl font-black tracking-tight ${isBudgetLow ? 'text-orange-500' : 'text-white'}`}>
            {systemBudget.toLocaleString()} đ
          </p>
        </div>

        <div className="mx-6 border-t border-white/5"></div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 text-gray-500">
            <TrendingUp size={16} className="text-[#ff8c00]" />
            <span className="text-[10px] font-black uppercase tracking-widest">Thống kê trọn đời</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-gray-500 uppercase">Tổng tiền đã vay</p>
              <p className="text-xl font-black text-white">
                {loans
                  .filter(l => l.status === 'ĐANG NỢ' || l.status === 'CHỜ TẤT TOÁN' || l.status === 'ĐÃ TẤT TOÁN' || l.status === 'ĐANG GIẢI NGÂN')
                  .reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} đ
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[9px] font-bold text-gray-500 uppercase">Phí phạt quá hạn</p>
              <p className="text-xl font-black text-red-500">
                {loans.reduce((acc, curr) => acc + (curr.fine || 0), 0).toLocaleString()} đ
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111111] border border-white/5 rounded-[2.5rem] p-6 space-y-4">
          <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
            <CreditCard size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-gray-500 uppercase">Dư nợ hiện tại</p>
            <p className={`text-xl font-black ${currentDebt > 0 ? 'text-red-500' : 'text-white'}`}>
              {currentDebt.toLocaleString()} đ
            </p>
          </div>
        </div>

        <div className="bg-[#111111] border border-white/5 rounded-[2.5rem] p-6 space-y-4 relative overflow-hidden group">
          <div className="w-10 h-10 bg-[#ff8c00]/10 rounded-2xl flex items-center justify-center text-[#ff8c00]">
            <CalendarDays size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Kỳ hạn tiếp theo</p>
            <p className="text-lg font-black text-white">{loans.length > 0 ? displayDueDate : '--/--/--'}</p>
          </div>
        </div>
      </div>

      <div className="pt-4 space-y-4">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2 text-gray-400">
             <History size={16} />
             <h3 className="text-[10px] font-black uppercase tracking-widest">GIAO DỊCH GẦN NHẤT</h3>
          </div>
          {loans.length > 5 && (
            <button 
              onClick={() => setShowAllHistory(!showAllHistory)}
              className="text-[9px] font-black text-[#ff8c00] uppercase tracking-widest bg-[#ff8c00]/10 px-3 py-1.5 rounded-full active:scale-95 transition-all"
            >
              Xem tất cả
            </button>
          )}
        </div>

        <div className="space-y-3 pb-8">
          {loans.length === 0 ? (
            <div className="bg-[#111111]/50 border border-white/5 border-dashed rounded-[1.5rem] p-10 text-center">
              <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Chưa có giao dịch nào</p>
            </div>
          ) : (
            displayedLoans.map((item, idx) => {
              const [d, m, y] = item.date.split('/').map(Number);
              const isOverdue = (item.status === 'ĐANG NỢ' || item.status === 'CHỜ TẤT TOÁN') && new Date(y, m - 1, d) < today;
              const statusColor = getStatusStyles(item.status, isOverdue);

              return (
                <div key={idx} className={`bg-[#111111] border rounded-[1.5rem] p-4 flex flex-col gap-3 ${isOverdue ? 'border-red-600/30 bg-red-600/5' : 'border-white/5'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-base font-black text-white leading-none mb-1">{item.amount.toLocaleString()} đ</p>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'ĐÃ TẤT TOÁN' ? 'bg-green-500' : isOverdue ? 'bg-red-500 animate-pulse' : 'bg-orange-500 animate-pulse'}`}></div>
                          <span className={`text-[8px] font-black uppercase ${statusColor}`}>
                            {isOverdue ? 'QUÁ HẠN' : item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       {onViewContract && (
                         <button 
                           onClick={() => onViewContract(item)}
                           className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-gray-500 hover:text-white transition-all"
                         >
                           <Eye size={16} />
                         </button>
                       )}
                       {(item.status === 'ĐANG NỢ' || item.status === 'ĐANG GIẢI NGÂN') && onSettleLoan && (
                         <button 
                           onClick={() => onSettleLoan(item)}
                           className="bg-white text-black font-black px-3 py-1.5 rounded-lg text-[8px] uppercase tracking-widest active:scale-95 transition-all"
                         >
                           Tất toán
                         </button>
                       )}
                    </div>
                  </div>
                  
                  {item.rejectionReason && (item.status === 'BỊ TỪ CHỐI' || item.status === 'ĐANG NỢ') && (
                    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-2 flex items-center justify-center gap-2">
                      <AlertCircle size={12} className="text-red-500 shrink-0" />
                      <p className="text-[8px] font-black text-red-500/80 uppercase tracking-widest text-center">
                        Lý do: {item.rejectionReason}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-white/5 pt-2">
                    <div className="flex gap-3">
                      <p className="text-[8px] font-bold text-gray-700">Hạn: {item.date}</p>
                      <p className="text-[8px] font-bold text-gray-700">Tạo: {item.createdAt}</p>
                    </div>
                    {isOverdue && (
                      <div className="text-right">
                        <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest leading-none">Phí phạt trễ hạn</p>
                        <p className="text-[10px] font-black text-red-500">{(item.fine || 0).toLocaleString()} đ</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showNotifications && (
        <NotificationModal 
          notifications={notifications} 
          onClose={() => setShowNotifications(false)} 
          onMarkRead={(id) => onMarkNotificationRead?.(id)}
        />
      )}
    </div>
  );
};

export default Dashboard;
