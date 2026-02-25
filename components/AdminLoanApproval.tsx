
import React, { useState } from 'react';
import { LoanRecord } from '../types';
import { 
  Search, 
  User, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

interface AdminLoanApprovalProps {
  loans: LoanRecord[];
  onAction: (loanId: string, action: 'APPROVE' | 'DISBURSE' | 'SETTLE' | 'REJECT', reason?: string) => void;
  onBack: () => void;
}

const AdminLoanApproval: React.FC<AdminLoanApprovalProps> = ({ loans, onAction, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [rejectingLoanId, setRejectingLoanId] = useState<string | null>(null);

  // Nhóm các khoản vay theo User
  const groupedLoans: Record<string, { name: string; loans: LoanRecord[] }> = {};
  
  loans.forEach(loan => {
    const uid = loan.userId || 'unknown';
    if (!groupedLoans[uid]) {
      groupedLoans[uid] = { name: loan.userName || 'ẨN DANH', loans: [] };
    }
    groupedLoans[uid].loans.push(loan);
  });

  const users = Object.keys(groupedLoans).filter(uid => 
    groupedLoans[uid].name.toLowerCase().includes(searchTerm.toLowerCase()) || uid.includes(searchTerm)
  );

  const pendingApprovalCount = loans.filter(l => l.status === 'CHỜ DUYỆT').length;
  const pendingSettlementCount = loans.filter(l => l.status === 'CHỜ TẤT TOÁN').length;

  const getStatusStyles = (status: string, isOverdue: boolean) => {
    if (isOverdue) return 'bg-red-500/10 text-red-500';
    switch (status) {
      case 'CHỜ DUYỆT': return 'bg-orange-500/10 text-orange-500';
      case 'ĐÃ DUYỆT': return 'bg-blue-500/10 text-blue-500';
      case 'ĐANG GIẢI NGÂN': return 'bg-cyan-500/10 text-cyan-500';
      case 'ĐANG NỢ': return 'bg-orange-600/10 text-orange-600';
      case 'CHỜ TẤT TOÁN': return 'bg-indigo-500/10 text-indigo-500';
      case 'ĐÃ TẤT TOÁN': return 'bg-green-500/10 text-green-500';
      case 'BỊ TỪ CHỐI': return 'bg-gray-500/10 text-gray-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="w-full bg-black min-h-screen px-5 pb-32 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 pt-10 mb-8">
        <button onClick={onBack} className="text-white bg-white/5 p-2 rounded-full active:scale-90 transition-all">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">DUYỆT VAY & TẤT TOÁN</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-orange-500/10 border border-orange-500/20 px-4 py-3 rounded-2xl flex flex-col gap-1">
          <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest opacity-60">Chờ duyệt vay</span>
          <span className="text-xl font-black text-orange-500">{pendingApprovalCount}</span>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-3 rounded-2xl flex flex-col gap-1">
          <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest opacity-60">Chờ tất toán</span>
          <span className="text-xl font-black text-blue-500">{pendingSettlementCount}</span>
        </div>
      </div>

      <div className="relative mb-8">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">
          <Search size={20} />
        </div>
        <input 
          type="text"
          placeholder="Tìm khách hàng hoặc mã HĐ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#111111] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-white focus:outline-none focus:border-orange-500/30 transition-all"
        />
      </div>

      <div className="space-y-6">
        {users.length === 0 ? (
          <div className="py-20 text-center opacity-30">
            <p className="text-xs font-black uppercase tracking-widest">Chưa có dữ liệu giao dịch</p>
          </div>
        ) : (
          users.map(uid => {
            const userGroup = groupedLoans[uid];
            const isExpanded = expandedUserId === uid;
            const notificationCount = userGroup.loans.filter(l => l.status === 'CHỜ DUYỆT' || l.status === 'CHỜ TẤT TOÁN').length;

            return (
              <div key={uid} className="bg-[#111111] border border-white/5 rounded-[2rem] overflow-hidden">
                <div 
                  onClick={() => setExpandedUserId(isExpanded ? null : uid)}
                  className="p-6 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1a1a1e] rounded-xl flex items-center justify-center text-[#ff8c00]">
                      < User size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase">{userGroup.name}</h3>
                      <p className="text-[9px] font-bold text-gray-500 uppercase">ID: {uid}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {notificationCount > 0 && (
                      <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                         <span className="text-[10px] font-black text-white">{notificationCount}</span>
                      </div>
                    )}
                    <div className="text-gray-500">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="w-full h-px bg-white/5"></div>
                    {userGroup.loans.map(loan => {
                      const today = new Date();
                      const [d, m, y] = loan.date.split('/').map(Number);
                      const dueDate = new Date(y, m - 1, d);
                      const isOverdue = (loan.status === 'ĐANG NỢ' || loan.status === 'CHỜ TẤT TOÁN') && dueDate < today;
                      const statusStyles = getStatusStyles(loan.status, isOverdue);

                      return (
                        <div key={loan.id} className={`bg-black/40 border rounded-3xl p-5 space-y-4 ${isOverdue ? 'border-red-600/30 ring-1 ring-red-600/10' : 'border-white/5'}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{loan.id}</p>
                              <h4 className="text-lg font-black text-white">{loan.amount.toLocaleString()} đ</h4>
                            </div>
                            <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase ${statusStyles}`}>
                              {isOverdue ? 'QUÁ HẠN' : loan.status}
                            </span>
                          </div>

                          {loan.status === 'CHỜ TẤT TOÁN' && (
                            <div className="space-y-3 bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4">
                              <div className="flex items-center gap-2">
                                <ImageIcon size={14} className="text-blue-500" />
                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Bill Đối Soát Tất Toán</span>
                              </div>
                              <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-white/5">
                                {loan.billImage ? (
                                  <img src={loan.billImage} className="w-full h-full object-cover" alt="Bill tất toán" />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-800 gap-2">
                                      <Clock size={20} />
                                      <span className="text-[8px] font-black uppercase">Thiếu minh chứng bill</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            {loan.status === 'CHỜ DUYỆT' && (
                              <div className="flex flex-col gap-2 w-full">
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => onAction(loan.id, 'APPROVE')}
                                    className="flex-1 bg-[#ff8c00] text-black py-3 rounded-xl font-black text-[10px] uppercase active:scale-95 transition-all"
                                  >
                                    Duyệt vay
                                  </button>
                                  <button 
                                    onClick={() => setRejectingLoanId(rejectingLoanId === loan.id ? null : loan.id)}
                                    className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase active:scale-95 transition-all flex items-center justify-center gap-2 ${rejectingLoanId === loan.id ? 'bg-red-600 text-white' : 'bg-white/5 border border-white/10 text-red-500'}`}
                                  >
                                    <XCircle size={14} /> {rejectingLoanId === loan.id ? 'Hủy' : 'Từ chối'}
                                  </button>
                                </div>
                                {rejectingLoanId === loan.id && (
                                  <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-200">
                                    {[
                                      "Hồ sơ không đạt",
                                      "Thông tin sai lệch",
                                      "Nợ xấu hệ thống",
                                      "Vượt quá hạn mức"
                                    ].map((reason) => (
                                      <button 
                                        key={reason}
                                        onClick={() => { 
                                          alert(`Đã từ chối: ${reason}`); 
                                          onAction(loan.id, 'REJECT', reason);
                                          setRejectingLoanId(null);
                                        }}
                                        className="bg-red-500/10 text-red-500/70 py-2 rounded-lg font-bold text-[8px] uppercase border border-red-500/10 hover:bg-red-500/20 transition-all"
                                      >
                                        {reason}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            {loan.status === 'ĐÃ DUYỆT' && (
                              <button 
                                onClick={() => onAction(loan.id, 'DISBURSE')}
                                className="w-full bg-green-600 text-white py-3 rounded-xl font-black text-[10px] uppercase active:scale-95 transition-all"
                              >
                                Giải ngân tiền
                              </button>
                            )}
                            {loan.status === 'CHỜ TẤT TOÁN' && (
                              <div className="flex flex-col gap-2 w-full">
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => onAction(loan.id, 'SETTLE')}
                                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-black text-[10px] uppercase active:scale-95 transition-all flex items-center justify-center gap-2"
                                  >
                                    <CheckCircle2 size={14} /> Xác nhận bill
                                  </button>
                                  <button 
                                    onClick={() => setRejectingLoanId(rejectingLoanId === loan.id ? null : loan.id)}
                                    className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase active:scale-95 transition-all flex items-center justify-center gap-2 ${rejectingLoanId === loan.id ? 'bg-red-600 text-white' : 'bg-white/5 border border-white/10 text-red-500'}`}
                                  >
                                    <XCircle size={14} /> {rejectingLoanId === loan.id ? 'Hủy' : 'Từ chối'}
                                  </button>
                                </div>
                                
                                {rejectingLoanId === loan.id && (
                                  <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-200">
                                    {[
                                      "Bill không hợp lệ",
                                      "Sai nội dung",
                                      "Sai số tiền",
                                      "Ảnh mờ/Lỗi"
                                    ].map((reason) => (
                                      <button 
                                        key={reason}
                                        onClick={() => { 
                                          alert(`Đã từ chối: ${reason}`); 
                                          onAction(loan.id, 'REJECT', reason);
                                          setRejectingLoanId(null);
                                        }}
                                        className="bg-red-500/10 text-red-500/70 py-2 rounded-lg font-bold text-[8px] uppercase border border-red-500/10 hover:bg-red-500/20 transition-all"
                                      >
                                        {reason}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminLoanApproval;
