// Admin management component for users and loans
import React, { useState } from 'react';
import { User as UserType, LoanRecord } from '../types';
import { 
  Search, 
  User, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  TrendingUp, 
  Hash, 
  Phone, 
  Image as ImageIcon,
  Users,
  MapPin,
  Calendar,
  ChevronLeft,
  FileText,
  CheckCircle2,
  Briefcase,
  Clock,
  Eye,
  Coins,
  ArrowDownToLine,
  AlertTriangle,
  ChevronRight,
  History,
  Camera,
  Trash2,
  X,
  AlertCircle,
  RefreshCcw,
  CheckCircle,
  XCircle,
  Landmark,
  Copy,
  Check
} from 'lucide-react';
import ContractModal from './ContractModal';

interface AdminUserManagementProps {
  users: UserType[];
  loans: LoanRecord[];
  onAction: (userId: string, action: 'APPROVE_RANK' | 'REJECT_RANK') => void;
  onLoanAction: (loanId: string, action: 'APPROVE' | 'DISBURSE' | 'SETTLE' | 'REJECT', reason?: string) => void;
  onDeleteUser: (userId: string) => void;
  onAutoCleanup: () => number;
  onBack: () => void;
}

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ users, loans, onAction, onLoanAction, onDeleteUser, onAutoCleanup, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<Record<string, 'INFO' | 'LOANS'>>({});
  const [showAllLoansAdmin, setShowAllLoansAdmin] = useState<Record<string, boolean>>({});
  const [selectedContract, setSelectedContract] = useState<{ loan: LoanRecord, owner: UserType } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);
  const [cleanupResultCount, setCleanupResultCount] = useState<number | null>(null);
  const [rejectingLoanId, setRejectingLoanId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.phone.includes(searchTerm) ||
    u.id.includes(searchTerm)
  );

  const isUserBadDebt = (userId: string) => {
    const userLoans = loans.filter(l => l.userId === userId && (l.status === 'ĐANG NỢ' || l.status === 'CHỜ TẤT TOÁN'));
    const today = new Date();
    return userLoans.some(l => {
      const [d, m, y] = l.date.split('/').map(Number);
      const dueDate = new Date(y, m - 1, d);
      return dueDate < today;
    });
  };

  const getRankName = (rank: string) => {
    switch(rank) {
      case 'standard': return 'TIÊU CHUẨN';
      case 'bronze': return 'HẠNG ĐỒNG';
      case 'silver': return 'HẠNG BẠC';
      case 'gold': return 'HẠNG VÀNG';
      case 'diamond': return 'KIM CƯƠNG';
      default: return 'TIÊU CHUẨN';
    }
  };

  const getStatusStyles = (status: string, isOverdue: boolean) => {
    if (isOverdue) return 'bg-red-500/20 text-red-500';
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

  const getUserNotificationCount = (userId: string) => {
    const user = users.find(u => u.id === userId);
    const userLoans = loans.filter(l => l.userId === userId);
    
    let count = 0;
    count += userLoans.filter(l => l.status === 'CHỜ DUYỆT' || l.status === 'CHỜ TẤT TOÁN').length;
    if (user?.pendingUpgradeRank) count += 1;
    
    return count;
  };

  const handleToggleUser = (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
    } else {
      setExpandedUserId(userId);
      if (!activeSection[userId]) {
        setActiveSection(prev => ({ ...prev, [userId]: 'INFO' }));
      }
    }
  };

  const toggleShowAllLoans = (userId: string) => {
    setShowAllLoansAdmin(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleDeleteConfirm = () => {
    if (confirmDeleteId) {
      onDeleteUser(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const handleCleanupConfirm = () => {
    const count = onAutoCleanup();
    setCleanupResultCount(count);
    setShowCleanupConfirm(false);
  };

  return (
    <div className="w-full bg-[#0a0a0a] min-h-screen px-5 pb-32 animate-in fade-in duration-500 relative">
      <div className="flex items-center justify-between pt-8 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 bg-[#16161a] border border-white/5 rounded-full flex items-center justify-center text-white active:scale-90">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">QUẢN LÝ KHÁCH HÀNG</h1>
        </div>
        <button 
          onClick={() => setShowCleanupConfirm(true)}
          className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-colors active:scale-95"
          title="Dọn dẹp tự động (60 ngày)"
        >
           <RefreshCcw size={14} className="text-[#ff8c00]" />
           <span className="text-[9px] font-black text-white uppercase tracking-widest">Dọn dẹp</span>
        </button>
      </div>

      <div className="relative mb-8">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600">
          <Search size={20} />
        </div>
        <input 
          type="text"
          placeholder="Tìm Tên, Số Zalo hoặc ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#111111] border border-white/5 rounded-[1.5rem] py-5 pl-14 pr-6 text-sm font-bold text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition-all"
        />
      </div>

      <div className="space-y-4">
        {filteredUsers.map((u) => {
          const notificationCount = getUserNotificationCount(u.id);
          const isExpanded = expandedUserId === u.id;
          const userLoans = [...loans]
            .filter(l => l.userId === u.id)
            .sort((a, b) => {
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
          const currentSection = activeSection[u.id] || 'INFO';
          const badDebt = isUserBadDebt(u.id);
          const showAll = showAllLoansAdmin[u.id] || false;
          const displayedUserLoans = showAll ? userLoans : userLoans.slice(0, 3);

          const disbursedLoans = userLoans.filter(l => 
            ['ĐANG NỢ', 'CHỜ TẤT TOÁN', 'ĐANG GIẢI NGÂN', 'ĐANG ĐỐI SOÁT'].includes(l.status)
          );
          const tongThucThu = disbursedLoans.reduce((sum, l) => sum + l.amount + (l.fine || 0), 0);

          return (
            <div key={u.id} className={`bg-[#111111] border rounded-[2.5rem] overflow-hidden relative shadow-lg transition-all ${badDebt ? 'border-red-600/50 ring-1 ring-red-600/20' : 'border-white/5'}`}>
              <div 
                onClick={() => handleToggleUser(u.id)}
                className="cursor-pointer active:bg-white/[0.01] transition-all"
              >
                <div className="p-6 pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#1a1a1e] rounded-2xl flex items-center justify-center text-gray-500 border border-white/5 relative">
                      <User size={24} className={isExpanded ? 'text-[#ff8c00]' : ''} />
                      {notificationCount > 0 && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center border-2 border-[#111111] shadow-lg">
                          <span className="text-[10px] font-black text-white">{notificationCount}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-black text-white tracking-tight uppercase leading-none">{u.fullName}</h3>
                        {badDebt && (
                          <div className="flex items-center gap-1 bg-red-600 px-2 py-0.5 rounded-lg animate-pulse">
                            <AlertTriangle size={10} className="text-white" />
                            <span className="text-[8px] font-black text-white uppercase tracking-tighter">NỢ XẤU</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-gray-600 tracking-widest uppercase">MÃ KHÁCH: {u.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-500">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                <div className="mx-4 mb-4 bg-black/40 border border-white/5 rounded-[2rem] p-5 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-white/5 rounded-2xl flex items-center justify-center text-gray-600">
                      <Coins size={22} />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">TỔNG THỰC THU:</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-white tracking-tight leading-none mb-1.5">{tongThucThu.toLocaleString()} đ</p>
                    <p className="text-[7px] font-black text-gray-600 uppercase tracking-tighter">
                      (GỐC + PHẠT TRÊN DƯ NỢ)
                    </p>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-6 pb-10 space-y-8 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex gap-2 p-1 bg-black/40 rounded-2xl mx-2 border border-white/5">
                    <button 
                      onClick={() => setActiveSection(prev => ({ ...prev, [u.id]: 'INFO' }))}
                      className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${currentSection === 'INFO' ? 'bg-[#ff8c00] text-black shadow-lg shadow-orange-500/10' : 'text-gray-500'}`}
                    >
                      <FileText size={14} /> Thông tin
                    </button>
                    <button 
                      onClick={() => setActiveSection(prev => ({ ...prev, [u.id]: 'LOANS' }))}
                      className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 relative ${currentSection === 'LOANS' ? 'bg-[#ff8c00] text-black shadow-lg shadow-orange-500/10' : 'text-gray-500'}`}
                    >
                      <Briefcase size={14} /> Khoản vay
                    </button>
                  </div>

                  {currentSection === 'INFO' ? (
                    <div className="space-y-10 animate-in fade-in duration-300">
                      {u.pendingUpgradeRank && (
                        <div className="bg-orange-500/5 border border-orange-500/20 rounded-[2rem] p-6 space-y-6">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <ShieldCheck size={20} className="text-[#ff8c00]" />
                                 <div>
                                    <h4 className="text-[10px] font-black text-[#ff8c00] uppercase tracking-widest">Nâng hạng</h4>
                                    <p className="text-xs font-black text-white uppercase">{getRankName(u.pendingUpgradeRank)}</p>
                                 </div>
                              </div>
                           </div>
                           <div className="aspect-video w-full bg-black rounded-2xl border border-white/5 overflow-hidden">
                              {u.rankUpgradeBill ? <img src={u.rankUpgradeBill} className="w-full h-full object-cover" alt="Upgrade bill" /> : <div className="w-full h-full flex items-center justify-center text-gray-800 text-[8px] font-black uppercase">Thiếu bill</div>}
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <button onClick={() => onAction(u.id, 'APPROVE_RANK')} className="py-4 bg-[#ff8c00] text-black font-black text-[10px] uppercase rounded-xl flex items-center justify-center gap-2">Duyệt hạng</button>
                              <button onClick={() => onAction(u.id, 'REJECT_RANK')} className="py-4 bg-white/5 border border-white/10 text-gray-500 font-black text-[10px] uppercase rounded-xl">Từ chối</button>
                           </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-y-10 px-2">
                        <div className="space-y-1"><div className="flex items-center gap-2"><ShieldCheck size={14} className="text-[#ff8c00]" /><p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Hạng</p></div><p className="text-sm font-black text-[#ff8c00] uppercase">{getRankName(u.rank)}</p></div>
                        <div className="space-y-1"><div className="flex items-center gap-2"><TrendingUp size={14} className="text-[#ff8c00]" /><p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Hạn mức</p></div><p className="text-sm font-black text-white">{(u.totalLimit || 0).toLocaleString()} đ</p></div>
                        <div className="space-y-1"><div className="flex items-center gap-2"><Hash size={14} className="text-[#ff8c00]" /><p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">CCCD</p></div><p className="text-sm font-black text-white">{u.idNumber}</p></div>
                        <div className="space-y-1"><div className="flex items-center gap-2"><Phone size={14} className="text-[#ff8c00]" /><p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Zalo</p></div><p className="text-sm font-black text-white">{u.phone}</p></div>
                        <div className="space-y-1"><div className="flex items-center gap-2"><Users size={14} className="text-[#ff8c00]" /><p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Tham chiếu</p></div><p className="text-sm font-black text-white truncate">{u.refZalo || 'CHƯA CẬP NHẬT'}</p></div>
                        <div className="space-y-1"><div className="flex items-center gap-2"><MapPin size={14} className="text-[#ff8c00]" /><p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Địa chỉ</p></div><p className="text-xs font-black text-white leading-tight line-clamp-2">{u.address || 'CHƯA CẬP NHẬT'}</p></div>
                      </div>

                      <div className="space-y-6 px-2 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2 text-[#ff8c00]">
                          <Camera size={18} />
                          <h4 className="text-[10px] font-black uppercase tracking-widest">Hồ sơ CCCD gốc</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-1">Mặt trước</p>
                            <div className="aspect-video w-full bg-black rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center">
                              {u.idFront ? (
                                <img src={u.idFront} className="w-full h-full object-cover" alt="CCCD Front" />
                              ) : (
                                <ImageIcon size={24} className="text-gray-900" />
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-1">Mặt sau</p>
                            <div className="aspect-video w-full bg-black rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center">
                              {u.idBack ? (
                                <img src={u.idBack} className="w-full h-full object-cover" alt="CCCD Back" />
                              ) : (
                                <ImageIcon size={24} className="text-gray-900" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 px-2 pt-6 border-t border-white/5">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-600"><Calendar size={14} /><span className="text-[8px] font-black uppercase">Gia nhập: {u.joinDate || '--'}</span></div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setConfirmDeleteId(u.id)}
                                className="px-6 py-2.5 bg-red-600/10 border border-red-600/20 rounded-xl text-[10px] font-black uppercase text-red-600 active:scale-95 transition-all flex items-center gap-2"
                              >
                                <Trash2 size={14} /> Xóa User
                              </button>
                            </div>
                         </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-300">
                       <div className="flex justify-between items-center px-1 mb-2">
                          <div className="flex items-center gap-2 text-gray-500">
                             <History size={14} />
                             <span className="text-[10px] font-black uppercase tracking-widest">Lịch sử giao dịch</span>
                          </div>
                          {userLoans.length > 3 && (
                            <button 
                              onClick={() => toggleShowAllLoans(u.id)}
                              className="flex items-center gap-1 text-[9px] font-black text-[#ff8c00] uppercase tracking-widest hover:opacity-70 transition-opacity"
                            >
                              {showAll ? 'Thu gọn' : 'Xem tất cả'} <ChevronRight size={10} className={`transform transition-transform ${showAll ? '-rotate-90' : ''}`} />
                            </button>
                          )}
                       </div>

                       {userLoans.length === 0 ? (
                         <div className="py-16 text-center space-y-3 opacity-30">
                            <Briefcase size={24} className="mx-auto" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Chưa có hợp đồng vay nào</p>
                         </div>
                       ) : (
                         displayedUserLoans.map(loan => {
                           const [d, m, y] = loan.date.split('/').map(Number);
                           const isOverdue = (loan.status === 'ĐANG NỢ' || loan.status === 'CHỜ TẤT TOÁN') && new Date(y, m - 1, d) < new Date();
                           const statusStyles = getStatusStyles(loan.status, isOverdue);

                           return (
                             <div key={loan.id} className={`bg-black/40 border rounded-3xl p-6 space-y-6 shadow-inner ${isOverdue ? 'border-red-600/30 ring-1 ring-red-600/10' : 'border-white/5'}`}>
                                <div className="flex justify-between items-start">
                                   <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{loan.id}</p>
                                        <button onClick={() => setSelectedContract({ loan, owner: u })} className="w-6 h-6 bg-white/5 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#ff8c00]"><Eye size={14} /></button>
                                      </div>
                                      <h4 className="text-lg font-black text-white leading-none">{loan.amount.toLocaleString()} đ</h4>
                                   </div>
                                   <div className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase ${statusStyles}`}>
                                      {isOverdue ? 'QUÁ HẠN' : loan.status}
                                   </div>
                                </div>

                                {loan.status === 'CHỜ TẤT TOÁN' && (
                                  <div className="space-y-3 bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4">
                                     <div className="flex items-center gap-2 text-blue-500"><ImageIcon size={14} /><span className="text-[9px] font-black uppercase tracking-widest">Bill Tất Toán</span></div>
                                     <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-white/5">
                                        {loan.billImage ? <img src={loan.billImage} className="w-full h-full object-cover" alt="Bill payment" /> : <div className="w-full h-full flex items-center justify-center"><Clock size={16} className="text-gray-800" /></div>}
                                     </div>
                                  </div>
                                )}

                                {['CHỜ DUYỆT', 'ĐÃ DUYỆT'].includes(loan.status) && (
                                  <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-blue-500">
                                      <Landmark size={14} />
                                      <h4 className="text-[9px] font-black uppercase tracking-widest">Tài khoản nhận tiền</h4>
                                    </div>
                                    {u.bankName ? (
                                      <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                          <span className="text-[7px] font-black text-gray-600 uppercase">Ngân hàng:</span>
                                          <span className="text-[9px] font-black text-white uppercase">{u.bankName}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-[7px] font-black text-gray-600 uppercase">Số tài khoản:</span>
                                          <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-black text-blue-400 tracking-widest">{u.bankAccountNumber}</span>
                                            <button 
                                              onClick={() => handleCopy(u.bankAccountNumber || '', u.id + loan.id)}
                                              className={`p-1.5 rounded-lg transition-all ${copiedId === u.id + loan.id ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                                            >
                                              {copiedId === u.id + loan.id ? <Check size={10} /> : <Copy size={10} />}
                                            </button>
                                          </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-[7px] font-black text-gray-600 uppercase">Chủ tài khoản:</span>
                                          <span className="text-[9px] font-black text-white uppercase">{u.bankAccountHolder}</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-[8px] font-black text-red-500 uppercase text-center">Khách chưa cập nhật tài khoản</p>
                                    )}
                                  </div>
                                )}

                                <div className="space-y-6 pt-2">
                                  <div className="flex gap-2">
                                    {loan.status === 'CHỜ DUYỆT' && (
                                      <div className="flex flex-col gap-2 w-full">
                                        <div className="flex gap-2">
                                          <button onClick={() => onLoanAction(loan.id, 'APPROVE')} className="flex-1 bg-[#ff8c00] text-black py-4 rounded-xl font-black text-[10px] uppercase active:scale-95 transition-all">Duyệt vay</button>
                                          <button 
                                            onClick={() => setRejectingLoanId(rejectingLoanId === loan.id ? null : loan.id)} 
                                            className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase active:scale-95 transition-all flex items-center justify-center gap-2 ${rejectingLoanId === loan.id ? 'bg-red-600 text-white' : 'bg-white/5 border border-white/10 text-red-500'}`}
                                          >
                                            <XCircle size={14} /> {rejectingLoanId === loan.id ? 'Hủy' : 'Từ chối'}
                                          </button>
                                        </div>
                                        {rejectingLoanId === loan.id && (
                                          <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-200">
                                            {["Hồ sơ không đạt", "Thông tin sai lệch", "Nợ xấu hệ thống", "Vượt quá hạn mức"].map((reason) => (
                                              <button 
                                                key={reason}
                                                onClick={() => { alert(`Đã từ chối: ${reason}`); onLoanAction(loan.id, 'REJECT', reason); setRejectingLoanId(null); }}
                                                className="bg-red-500/10 text-red-500/70 py-2 rounded-lg font-bold text-[8px] uppercase border border-red-500/10 hover:bg-red-500/20 transition-all"
                                              >
                                                {reason}
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    {loan.status === 'ĐÃ DUYỆT' && <button onClick={() => onLoanAction(loan.id, 'DISBURSE')} className="w-full bg-green-600 text-white py-4 rounded-xl font-black text-[10px] uppercase active:scale-95 transition-all">Giải ngân tiền</button>}
                                    {loan.status === 'CHỜ TẤT TOÁN' && (
                                      <div className="flex flex-col gap-2 w-full">
                                        <div className="flex gap-2">
                                          <button onClick={() => onLoanAction(loan.id, 'SETTLE')} className="flex-1 bg-green-600 text-white py-4 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"><CheckCircle2 size={14} /> Duyệt bill</button>
                                          <button 
                                            onClick={() => setRejectingLoanId(rejectingLoanId === loan.id ? null : loan.id)} 
                                            className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase active:scale-95 transition-all flex items-center justify-center gap-2 ${rejectingLoanId === loan.id ? 'bg-red-600 text-white' : 'bg-white/5 border border-white/10 text-red-500'}`}
                                          >
                                            <XCircle size={14} /> {rejectingLoanId === loan.id ? 'Hủy' : 'Từ chối'}
                                          </button>
                                        </div>
                                        {rejectingLoanId === loan.id && (
                                          <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-200">
                                            {["Bill không hợp lệ", "Sai nội dung", "Sai số tiền", "Ảnh mờ/Lỗi"].map((reason) => (
                                              <button 
                                                key={reason}
                                                onClick={() => { alert(`Đã từ chối: ${reason}`); onLoanAction(loan.id, 'REJECT', reason); setRejectingLoanId(null); }}
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

                                  {['CHỜ DUYỆT', 'ĐÃ DUYỆT'].includes(loan.status) && (
                                    <div className="flex flex-col items-center justify-center gap-1.5 py-3 bg-white/[0.03] border border-white/5 rounded-2xl">
                                      <div className="flex items-center gap-2">
                                        <ArrowDownToLine size={12} className="text-[#ff8c00]" />
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Số tiền Thực Giải ngân:</span>
                                      </div>
                                      <p className="text-sm font-black text-white tracking-tight">
                                        {(loan.amount * 0.85).toLocaleString()} VNĐ
                                      </p>
                                    </div>
                                  )}
                                </div>
                             </div>
                           );
                         })
                       )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="py-20 text-center space-y-4 opacity-30">
           <AlertTriangle size={32} className="mx-auto" />
           <p className="text-[10px] font-black uppercase tracking-widest">Không tìm thấy khách hàng</p>
        </div>
      )}

      {/* Confirmation Modal for Manual Delete */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#111111] border border-red-600/20 w-full max-w-sm rounded-[2.5rem] p-8 space-y-8 relative shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600"></div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center text-red-600">
                 <AlertCircle size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">XÓA NGƯỜI DÙNG?</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed px-4">
                  Bạn có chắc chắn muốn xóa vĩnh viễn khách hàng này cùng toàn bộ lịch sử vay? Thao tác này <span className="text-red-500 font-black">KHÔNG THỂ HOÀN TÁC</span>.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
               <button 
                 onClick={() => setConfirmDeleteId(null)}
                 className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                 <X size={14} /> HỦY BỎ
               </button>
               <button 
                 onClick={handleDeleteConfirm}
                 className="flex-1 py-4 bg-red-600 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/40"
               >
                 <Trash2 size={14} /> ĐỒNG Ý XÓA
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Auto Cleanup */}
      {showCleanupConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#111111] border border-orange-600/20 w-full max-w-sm rounded-[2.5rem] p-8 space-y-8 relative shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-600"></div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-orange-600/10 rounded-full flex items-center justify-center text-orange-600">
                 <RefreshCcw size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">XÁC NHẬN DỌN DẸP?</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed px-4">
                  Hệ thống sẽ tự động xóa tất cả người dùng <span className="text-orange-500">không hoạt động trên 60 ngày</span> kể từ lần tất toán cuối. Bạn có chắc chắn?
                </p>
              </div>
            </div>

            <div className="flex gap-3">
               <button 
                 onClick={() => setShowCleanupConfirm(false)}
                 className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                 <X size={14} /> HỦY BỎ
               </button>
               <button 
                 onClick={handleCleanupConfirm}
                 className="flex-1 py-4 bg-orange-600 rounded-2xl text-[10px] font-black text-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-900/40"
               >
                 <CheckCircle size={14} /> BẮT ĐẦU
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Cleanup Result Summary Modal */}
      {cleanupResultCount !== null && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="bg-[#111111] border border-green-600/20 w-full max-w-sm rounded-[2.5rem] p-8 space-y-8 relative shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-green-600"></div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-green-600/10 rounded-full flex items-center justify-center text-green-600">
                 <CheckCircle2 size={48} />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">BÁO CÁO DỌN DẸP</h3>
                <div className="bg-black/40 rounded-2xl p-6 border border-white/5 shadow-inner">
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Kết quả thực thi</p>
                   <p className="text-3xl font-black text-green-500">{cleanupResultCount} <span className="text-sm">User</span></p>
                   <p className="text-[9px] font-bold text-gray-600 uppercase mt-2 leading-tight">Đã được dọn dẹp vĩnh viễn khỏi hệ thống (Dữ liệu {'>'} 60 ngày).</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setCleanupResultCount(null)}
              className="w-full py-4 bg-green-600 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-green-900/40"
            >
              ĐÃ HIỂU & ĐÓNG
            </button>
          </div>
        </div>
      )}

      {selectedContract && (
        <ContractModal 
          contract={selectedContract.loan} 
          user={selectedContract.owner} 
          onClose={() => setSelectedContract(null)} 
        />
      )}
    </div>
  );
};

export default AdminUserManagement;