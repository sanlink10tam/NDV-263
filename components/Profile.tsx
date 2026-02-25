
import React, { useState } from 'react';
import { User } from '../types';
import { 
  User as UserIcon, 
  Phone, 
  Hash, 
  Lock, 
  FileText, 
  Headphones, 
  ChevronRight, 
  LogOut,
  ShieldCheck,
  X,
  Landmark,
  CreditCard
} from 'lucide-react';
import SecurityModal from './SecurityModal';
import TermsModal from './TermsModal';
import BankInfoModal from './BankInfoModal';

interface ProfileProps {
  user: User | null;
  onBack: () => void;
  onLogout: () => void;
  onUpdateBank?: (bankData: { bankName: string; bankAccountNumber: string; bankAccountHolder: string }) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onBack, onLogout, onUpdateBank }) => {
  const [showSecurity, setShowSecurity] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showBankInfo, setShowBankInfo] = useState(false);

  const getRankName = (rank?: string) => {
    switch(rank) {
      case 'standard': return 'Thành viên Tiêu chuẩn';
      case 'bronze': return 'Thành viên hạng Đồng';
      case 'silver': return 'Thành viên hạng Bạc';
      case 'gold': return 'Thành viên hạng Vàng';
      case 'diamond': return 'Thành viên hạng Kim cương';
      default: return 'Thành viên Tiêu chuẩn';
    }
  };

  const handleSupportClick = () => {
    window.open('https://zalo.me/g/escncv086', '_blank');
  };

  return (
    <div className="w-full bg-black px-5 pb-24 space-y-8 animate-in fade-in duration-500">
      {/* Header Logo for Profile View with X Button */}
      <div className="w-full py-6 flex items-center justify-between bg-black z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-[#111111] border border-white/5 rounded-full flex items-center justify-center text-white active:scale-90 transition-all"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#ff8c00] rounded-lg flex items-center justify-center font-black text-black text-xs">NDV</div>
            <h1 className="text-xl font-black text-white tracking-widest uppercase">Money</h1>
          </div>
        </div>
        <button onClick={onLogout} className="text-gray-500 hover:text-white transition-colors">
          <LogOut size={24} />
        </button>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center space-y-4 pt-4">
        <div className="w-28 h-28 bg-[#ff8c00] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,140,0,0.2)]">
          <UserIcon size={48} className="text-black" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{user?.fullName || 'CHƯA CẬP NHẬT'}</h2>
          <div className="bg-[#111111] px-6 py-1.5 rounded-full border border-white/5">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">{getRankName(user?.rank)}</span>
          </div>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">ID: {user?.id}</p>
        </div>
      </div>

      {/* Personal Info Grid - Updated to 2 columns */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-[#111111] border border-white/5 rounded-[2rem] p-6 space-y-3">
          <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400">
            <Phone size={18} />
          </div>
          <div className="space-y-0.5">
            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Số Zalo</p>
            <p className="text-sm font-black text-white tracking-tight truncate">{user?.phone || '...'}</p>
          </div>
        </div>

        <div className="bg-[#111111] border border-white/5 rounded-[2rem] p-6 space-y-3">
          <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400">
            <Hash size={18} />
          </div>
          <div className="space-y-0.5">
            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Định danh CCCD</p>
            <p className="text-sm font-black text-white tracking-tight truncate">{user?.idNumber || '...'}</p>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="space-y-3 pt-4">
        <button 
          onClick={() => setShowBankInfo(true)}
          className="w-full bg-[#111111] border border-white/5 rounded-[2rem] p-6 flex items-center justify-between group active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
              <Landmark size={20} />
            </div>
            <div className="text-left">
              <span className="text-xs font-black text-white uppercase tracking-widest block">Tài khoản ngân hàng</span>
              <p className="text-[9px] font-bold text-gray-500 uppercase mt-0.5">
                {user?.bankName ? `${user.bankName} - ${user.bankAccountNumber}` : 'Chưa cập nhật tài khoản nhận tiền'}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-700 group-hover:text-white" />
        </button>

        <button 
          onClick={() => setShowSecurity(true)}
          className="w-full bg-[#111111] border border-white/5 rounded-[2rem] p-6 flex items-center justify-between group active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
              <Lock size={20} />
            </div>
            <span className="text-xs font-black text-white uppercase tracking-widest">Bảo mật mật khẩu</span>
          </div>
          <ChevronRight size={18} className="text-gray-700 group-hover:text-white" />
        </button>

        <button 
          onClick={() => setShowTerms(true)}
          className="w-full bg-[#111111] border border-white/5 rounded-[2rem] p-6 flex items-center justify-between group active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-[#ff8c00]">
              <FileText size={20} />
            </div>
            <span className="text-xs font-black text-white uppercase tracking-widest">Điều khoản sử dụng</span>
          </div>
          <ChevronRight size={18} className="text-gray-700 group-hover:text-white" />
        </button>

        <button 
          onClick={handleSupportClick}
          className="w-full bg-[#111111] border border-white/5 rounded-[2rem] p-6 flex items-center justify-between group active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
              <Headphones size={20} />
            </div>
            <span className="text-xs font-black text-white uppercase tracking-widest">Hỗ trợ khách hàng 24/7</span>
          </div>
          <ChevronRight size={18} className="text-gray-700 group-hover:text-white" />
        </button>
      </div>

      {showSecurity && <SecurityModal onClose={() => setShowSecurity(false)} onLogout={onLogout} />}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showBankInfo && (
        <BankInfoModal 
          user={user} 
          onClose={() => setShowBankInfo(false)} 
          onUpdate={(data) => onUpdateBank?.(data)} 
        />
      )}
    </div>
  );
};

export default Profile;
