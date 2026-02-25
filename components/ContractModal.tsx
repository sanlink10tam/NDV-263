
import React from 'react';
import { User, LoanRecord } from '../types';
import { X, ShieldCheck, Download, Calendar, Award, Scale, AlertCircle, ShieldAlert, FileCheck, Landmark, ArrowDownToLine } from 'lucide-react';

interface ContractModalProps {
  contract: LoanRecord;
  user: User | null;
  onClose: () => void;
}

const ContractModal: React.FC<ContractModalProps> = ({ contract, user, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="w-full p-6 flex items-center justify-between bg-black text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-[#ff8c00]">
            <Award size={24} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest leading-none">Hợp đồng gốc kỹ thuật số</h3>
            <p className="text-[8px] font-bold text-gray-500 uppercase mt-1 tracking-tighter">XÁC THỰC BLOCKCHAIN V1.26 PRO</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-90"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 bg-black px-4 overflow-y-auto pb-32">
        <div className="bg-white w-full rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-2xl min-h-full border border-gray-100">
          
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-[0.03] rotate-[-35deg] select-none space-y-20">
            <span className="text-7xl font-black whitespace-nowrap">NDV MONEY ORIGINAL</span>
            <span className="text-7xl font-black whitespace-nowrap">AUTHENTIC DOCUMENT</span>
          </div>

          <div className="flex flex-col items-center space-y-6 relative z-10">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-[#ff8c00] font-black text-xl shadow-lg border-2 border-orange-500/20">
                NDV
               </div>
               <div className="h-10 w-px bg-gray-200"></div>
               <Landmark size={32} className="text-gray-300" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-black tracking-tighter uppercase leading-tight">Hợp đồng vay tiêu dùng</h2>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em]">Số hợp đồng: {contract.id}</p>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100 my-10 relative z-10"></div>

          <div className="space-y-10 px-1 relative z-10 pb-10">
            
            {/* Điều 1: Các bên giao kết */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white font-black text-[9px]">01</div>
                <h4 className="text-[10px] font-black text-black uppercase tracking-widest">Các bên giao kết</h4>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-gray-400 uppercase text-[8px] font-black tracking-widest">Bên cho vay (Bên A)</p>
                  <p className="text-[11px] text-black font-black uppercase">NDV MONEY FINANCIAL</p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase">Mã: NDV-CORP-V126</p>
                </div>
                <div className="space-y-1 md:text-right">
                  <p className="text-gray-400 uppercase text-[8px] font-black tracking-widest">Bên vay (Bên B)</p>
                  <p className="text-[11px] text-black font-black uppercase">{user?.fullName || 'KHÁCH HÀNG'}</p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase">CCCD: {user?.idNumber}</p>
                </div>
              </div>
            </section>

            {/* Điều 2: Nội dung khoản vay */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white font-black text-[9px]">02</div>
                <h4 className="text-[10px] font-black text-black uppercase tracking-widest">Nội dung khoản vay</h4>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-[9px] font-black text-gray-400 uppercase">Số tiền gốc vay:</span>
                  <span className="text-lg font-black text-black">{contract.amount.toLocaleString()} VNĐ</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-orange-500/5 px-4 rounded-xl border border-orange-500/10">
                  <div className="flex items-center gap-2">
                    <ArrowDownToLine size={14} className="text-orange-600" />
                    <span className="text-[9px] font-black text-orange-600 uppercase">Thực nhận (Sau phí):</span>
                  </div>
                  <span className="text-base font-black text-orange-700">{(contract.amount * 0.85).toLocaleString()} VNĐ</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-gray-400 uppercase">Ngày giải ngân</p>
                    <p className="text-[10px] font-black text-black">{contract.createdAt?.split(' ')[1] || '--/--/----'}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[8px] font-black text-gray-400 uppercase">Ngày đến hạn</p>
                    <p className="text-[10px] font-black text-orange-600">{contract.date}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Điều 3: Lãi suất & Phí */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white font-black text-[9px]">03</div>
                <h4 className="text-[10px] font-black text-black uppercase tracking-widest">Lãi suất & Phí</h4>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3 bg-green-500/5 px-4 py-2 rounded-xl border border-green-500/10 w-fit">
                  <FileCheck size={14} className="text-green-600" />
                  <span className="text-[9px] font-black text-green-700 uppercase">Ưu đãi: Lãi suất 0%</span>
                </div>
                <p className="text-[10px] font-bold text-gray-600 leading-relaxed">
                  - Phí dịch vụ hồ sơ: <span className="text-black font-black">15%</span> (Khấu trừ trực tiếp).<br/>
                  - Không phát sinh thêm bất kỳ chi phí ẩn nào khác trong suốt kỳ hạn.
                </p>
              </div>
            </section>

            {/* Điều 4: Chế tài vi phạm */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center text-white font-black text-[9px]">04</div>
                <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest">Chế tài vi phạm</h4>
              </div>
              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-600" />
                  <span className="text-[9px] font-black text-red-600 uppercase">Quy định chậm trả</span>
                </div>
                <ul className="text-[10px] font-bold text-gray-600 space-y-2 list-disc pl-4">
                  <li>Phí phạt trễ hạn: <span className="text-red-600 font-black">0.1% / ngày</span>.</li>
                  <li>Tối đa phí phạt không vượt quá 30% giá trị hợp đồng.</li>
                </ul>
              </div>
            </section>

            {/* Điều 5: Chữ ký xác thực */}
            <section className="space-y-6 pt-10 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col items-center space-y-4">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Đại diện (Bên A)</p>
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 flex items-center justify-center opacity-80 scale-110 -rotate-12">
                      <div className="w-full h-full rounded-full border-[3px] border-red-600 border-dashed flex flex-col items-center justify-center text-red-600">
                        <span className="text-[7px] font-black uppercase">NDV GROUP</span>
                        <ShieldCheck size={20} className="my-1" />
                        <span className="text-[5px] font-black uppercase">VERIFIED</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] font-black text-red-600 uppercase">ĐÃ KÝ SỐ</p>
                </div>

                <div className="flex flex-col items-center space-y-4">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Người vay (Bên B)</p>
                  <div className="w-full aspect-[4/3] bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                    {contract.signature ? (
                      <img src={contract.signature} className="w-full h-full object-contain mix-blend-multiply opacity-80 p-3" alt="Signature" />
                    ) : (
                      <div className="opacity-10"><FileCheck size={40} /></div>
                    )}
                  </div>
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">XÁC THỰC: {user?.fullName}</p>
                </div>
              </div>
            </section>
          </div>

          <div className="flex justify-center pt-8 border-t border-gray-50">
             <p className="text-[7px] font-bold text-gray-300 uppercase tracking-[0.4em]">Hợp đồng số hóa NDV Financial System v1.26</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-black flex gap-4 z-[110] border-t border-white/5">
        <button className="flex-1 py-5 rounded-[2rem] border border-white/10 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all bg-white/5">
          <Download size={16} />
          Bản gốc
        </button>
        <button 
          onClick={onClose}
          className="flex-[1.5] py-5 rounded-[2rem] bg-[#ff8c00] text-black font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-orange-950/20"
        >
          Xác nhận đóng
        </button>
      </div>
    </div>
  );
};

export default ContractModal;
