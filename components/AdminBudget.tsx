
import React, { useState, useEffect } from 'react';
import { TrendingUp, Wallet, AlertTriangle, ChevronLeft, Save, X, Check } from 'lucide-react';

interface AdminBudgetProps {
  currentBudget: number;
  onUpdate: (amount: number) => void;
  onBack: () => void;
}

const AdminBudget: React.FC<AdminBudgetProps> = ({ currentBudget, onUpdate, onBack }) => {
  const [inputValue, setInputValue] = useState(currentBudget.toLocaleString('vi-VN'));
  const [numericValue, setNumericValue] = useState(currentBudget);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setInputValue(currentBudget.toLocaleString('vi-VN'));
    setNumericValue(currentBudget);
  }, [currentBudget]);

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    const num = Number(rawVal);
    setNumericValue(num);
    const formatted = new Intl.NumberFormat('vi-VN').format(num);
    setInputValue(formatted);
  };

  const handleUpdateClick = () => {
    setShowConfirm(true);
  };

  const confirmUpdate = () => {
    onUpdate(numericValue);
    setShowConfirm(false);
    alert("Ngân sách hệ thống đã được cập nhật thành công.");
  };

  const isLowBudget = numericValue <= 2000000;

  return (
    <div className="w-full bg-black min-h-screen px-5 pb-32 animate-in fade-in duration-500 relative">
      <div className="flex items-center gap-4 pt-10 mb-8">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-[#111111] border border-white/5 rounded-full flex items-center justify-center text-white active:scale-90 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
          CẤU HÌNH NGÂN SÁCH
        </h1>
      </div>

      <div className="w-full bg-[#ff8c00] rounded-[3rem] p-8 space-y-8 relative overflow-hidden shadow-2xl shadow-orange-950/20 mb-8">
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
          <div className="w-40 h-40 border-[20px] border-black rounded-[3rem]"></div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-black text-black uppercase tracking-[0.2em] opacity-60">Vốn khả dụng hiện tại</p>
          <h2 className="text-4xl font-black text-black tracking-tighter leading-none">{currentBudget.toLocaleString()} đ</h2>
        </div>

        <div className="flex items-center gap-3">
           <Wallet size={16} className="text-black/60" />
           <span className="text-[8px] font-black text-black uppercase tracking-widest opacity-60">System Capital Managed by Admin</span>
        </div>
      </div>

      <div className="bg-[#111111] border border-white/5 rounded-[3rem] p-8 space-y-8 mb-8">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-[#ff8c00]" size={20} />
          <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Thay đổi tổng nguồn vốn</h4>
        </div>

        <div className="space-y-4">
           <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-1">Nhập số tiền mới (VND)</p>
           
           <div className={`bg-black border rounded-[2rem] p-6 flex items-center justify-between group transition-all ${isLowBudget ? 'border-red-500 ring-2 ring-red-500/20' : 'border-white/5'}`}>
              <input 
                type="text" 
                value={inputValue}
                onChange={handleBudgetChange}
                className={`bg-transparent text-3xl font-black tracking-tighter focus:outline-none w-full text-center ${isLowBudget ? 'text-red-500' : 'text-[#ff8c00]'}`}
              />
              <span className="text-gray-700 font-black text-xs tracking-widest uppercase ml-2">VND</span>
           </div>
           
           {isLowBudget && (
             <div className="flex items-center justify-center gap-2 text-red-500 animate-pulse">
                <AlertTriangle size={14} />
                <p className="text-[10px] font-black uppercase tracking-tighter">Cảnh báo: Ngân sách đang ở mức thấp (≤ 2tr)</p>
             </div>
           )}
        </div>

        <button 
          onClick={handleUpdateClick}
          className="w-full bg-[#ff8c00] text-black font-black py-6 rounded-[2rem] text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-orange-950/40 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Save size={18} />
          CẬP NHẬT NGÂN SÁCH
        </button>
      </div>

      {/* Popup xác nhận cập nhật ngân sách */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#111111] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 space-y-8 relative shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#ff8c00]"></div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-[#ff8c00]/10 rounded-full flex items-center justify-center text-[#ff8c00]">
                 <AlertTriangle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">XÁC NHẬN THAY ĐỔI</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed px-4">
                  Bạn có chắc chắn muốn thay đổi ngân sách hệ thống thành <span className="text-white font-black">{numericValue.toLocaleString()} đ</span>?
                </p>
              </div>
            </div>

            <div className="flex gap-3">
               <button 
                 onClick={() => setShowConfirm(false)}
                 className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                 <X size={14} /> HỦY BỎ
               </button>
               <button 
                 onClick={confirmUpdate}
                 className="flex-1 py-4 bg-[#ff8c00] rounded-2xl text-[10px] font-black text-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20"
               >
                 <Check size={14} /> XÁC NHẬN
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBudget;
