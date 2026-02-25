import React, { useState } from 'react';
import { User, UserRank } from '../types';
import { 
  Medal, 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  Trophy, 
  X, 
  ArrowUpCircle, 
  ChevronLeft, 
  Copy, 
  Camera, 
  UploadCloud,
  FileText,
  CircleHelp,
  Info,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { compressImage } from '../utils';

interface RankLimitsProps {
  user: User | null;
  onBack: () => void;
  onUpgrade: (targetRank: UserRank, bill: string) => void;
}

enum RankView {
  LIST = 'LIST',
  PAYMENT = 'PAYMENT'
}

const RankLimits: React.FC<RankLimitsProps> = ({ user, onBack, onUpgrade }) => {
  const [view, setView] = useState<RankView>(RankView.LIST);
  const [selectedRank, setSelectedRank] = useState<any>(null);
  const [billImage, setBillImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  const ranks = [
    {
      id: 'standard',
      name: 'TIÊU CHUẨN',
      code: 'TIEUCHUAN',
      min: '1.000.000 đ',
      max: '2.000.000 đ',
      limitVal: 2000000,
      icon: <Medal size={24} className="text-gray-500" />,
      features: ['Hạn mức 1 - 2 triệu', 'Duyệt trong 24h'],
    },
    {
      id: 'bronze',
      name: 'ĐỒNG',
      code: 'DONG',
      min: '1.000.000 đ',
      max: '3.000.000 đ',
      limitVal: 3000000,
      icon: <Star size={24} className="text-orange-300" />,
      features: ['Hạn mức 1 - 3 triệu', 'Ưu tiên duyệt lệnh'],
    },
    {
      id: 'silver',
      name: 'BẠC',
      code: 'BAC',
      min: '1.000.000 đ',
      max: '4.000.000 đ',
      limitVal: 4000000,
      icon: <Star size={24} className="text-blue-200" />,
      features: ['Hạn mức 1 - 4 triệu', 'Hỗ trợ 24/7'],
    },
    {
      id: 'gold',
      name: 'VÀNG',
      code: 'VANG',
      min: '1.000.000 đ',
      max: '5.000.000 đ',
      limitVal: 5000000,
      icon: <Medal size={24} className="text-yellow-400" />,
      features: ['Hạn mức 1 - 5 triệu', 'Giảm 10% phí phạt'],
    },
    {
      id: 'diamond',
      name: 'KIM CƯƠNG',
      code: 'KIMCUONG',
      min: '1.000.000 đ',
      max: '10.000.000 đ',
      limitVal: 10000000,
      icon: <ShieldCheck size={24} className="text-blue-400" />,
      features: ['Hạn mức 1 - 10 triệu', 'Duyệt lệnh tức thì'],
    }
  ];

  const currentRankIndex = ranks.findIndex(r => r.id === (user?.rank || 'standard'));

  const handleOpenPayment = (rank: any) => {
    setSelectedRank(rank);
    setView(RankView.LIST); // Need this for animation
    setTimeout(() => setView(RankView.PAYMENT), 50);
    setBillImage(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2000);
  };

  const handleBillUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string, 800, 800);
        setBillImage(compressed);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmUpgrade = () => {
    if (billImage && selectedRank) {
      onUpgrade(selectedRank.id as UserRank, billImage);
      setView(RankView.LIST);
    } else {
      alert("Vui lòng tải lên ảnh Bill thanh toán phí nâng hạng.");
    }
  };

  const hasPending = !!user?.pendingUpgradeRank;

  if (view === RankView.PAYMENT && selectedRank) {
    const fee = selectedRank.limitVal * 0.05;
    const transferContent = `${selectedRank.code} ${user?.id || 'xxxx'}`;

    return (
      <div className="w-full h-full bg-black animate-in slide-in-from-right duration-300 flex flex-col p-6 overflow-y-auto pb-32 relative">
        {copyToast && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[1000] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-green-600 text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2">
              <CheckCircle2 size={16} />
              Đã sao chép thành công
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView(RankView.LIST)}
              className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Phí nâng hạng {selectedRank.name}</h2>
          </div>
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showHelp ? 'bg-[#ff8c00] text-black shadow-lg shadow-orange-500/20' : 'bg-white/5 text-gray-400'}`}
          >
            <CircleHelp size={22} />
          </button>
        </div>

        {showHelp && (
          <div className="bg-[#ff8c00]/5 border border-[#ff8c00]/20 rounded-[2rem] p-6 mb-8 animate-in fade-in zoom-in duration-300 space-y-4">
             <div className="flex items-center gap-2">
                <Info size={18} className="text-[#ff8c00]" />
                <span className="text-[11px] font-black text-[#ff8c00] uppercase tracking-widest">Hướng dẫn chi tiết nâng hạng</span>
             </div>
             <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-[#ff8c00] rounded-full flex items-center justify-center shrink-0 font-black text-[10px] text-black">1</div>
                  <p className="text-[10px] font-bold text-gray-300 leading-tight">
                    Nhấn biểu tượng sao chép để lấy <span className="text-[#ff8c00]">STK</span>, <span className="text-[#ff8c00]">Số tiền</span> và <span className="text-[#ff8c00]">Nội dung chuyển khoản</span>.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-[#ff8c00] rounded-full flex items-center justify-center shrink-0 font-black text-[10px] text-black">2</div>
                  <p className="text-[10px] font-bold text-gray-300 leading-tight">
                    Mở ứng dụng Ngân hàng của bạn, thực hiện chuyển tiền chính xác thông tin đã lấy ở Bước 1.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-[#ff8c00] rounded-full flex items-center justify-center shrink-0 font-black text-[10px] text-black">3</div>
                  <p className="text-[10px] font-bold text-gray-300 leading-tight">
                    Chụp lại màn hình <span className="text-white">Biên lai giao dịch (Bill)</span> thành công.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-[#ff8c00] rounded-full flex items-center justify-center shrink-0 font-black text-[10px] text-black">4</div>
                  <p className="text-[10px] font-bold text-gray-300 leading-tight">
                    Tải ảnh Bill lên mục <span className="text-white">Tải ảnh Bill xác nhận</span> bên dưới và nhấn Gửi yêu cầu.
                  </p>
                </div>
             </div>
          </div>
        )}

        <div className="w-full min-h-[220px] bg-gradient-to-br from-[#1c1c1e] to-[#0a0a0a] rounded-[2.5rem] p-7 relative overflow-hidden shadow-2xl border border-white/10 mb-8 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#ff8c00] rounded-xl flex items-center justify-center font-black text-black text-[12px]">NDV</div>
              <span className="text-[10px] font-black text-white uppercase tracking-wider">VIP PLATINUM</span>
            </div>
            <div className="p-1.5 bg-orange-500/10 rounded-full">
              <ShieldCheck size={24} className="text-[#ff8c00]" />
            </div>
          </div>
          
          <div className="space-y-1 mb-4">
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">SỐ TÀI KHOẢN</span>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-mono font-black text-white tracking-[0.1em]">TIMOQNCGLIWQCLQ</p>
              <button onClick={() => copyToClipboard('TIMOQNCGLIWQCLQ')} className="p-2 bg-white/5 rounded-xl text-[#ff8c00] active:scale-90 transition-all"><Copy size={16} /></button>
            </div>
          </div>
          
          <div className="flex justify-between items-end mt-2">
            <div className="space-y-1">
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">CHỦ TÀI KHOẢN</p>
              <p className="text-[13px] font-black text-white uppercase tracking-tight">DO TRUNG NGON</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-0.5">NGÂN HÀNG</p>
              <p className="text-[11px] font-black text-[#ff8c00] uppercase tracking-tighter">TIMO (BẢN VIỆT)</p>
            </div>
          </div>
        </div>

        {/* Optimized 2-column detail section */}
        <div className="bg-[#111111] border border-white/5 rounded-[2rem] p-6 grid grid-cols-2 gap-4 mb-8 shadow-inner">
           <div className="flex flex-col gap-2 border-r border-white/5 pr-4">
              <div className="flex justify-between items-center">
                 <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Nội dung</span>
                 <button onClick={() => copyToClipboard(transferContent)} className="p-1 bg-white/5 rounded text-gray-400 hover:text-white transition-all"><Copy size={12} /></button>
              </div>
              <p className="text-xl font-black text-[#ff8c00] tracking-widest break-all">{transferContent}</p>
           </div>
           
           <div className="flex flex-col gap-2 pl-4">
              <div className="flex justify-between items-center">
                 <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Số tiền</span>
                 <button onClick={() => copyToClipboard(fee.toString())} className="p-1 bg-white/5 rounded text-gray-400 hover:text-white transition-all"><Copy size={12} /></button>
              </div>
              <p className="text-xl font-black text-[#ff8c00] tracking-tight">{fee.toLocaleString()} đ</p>
           </div>
        </div>

        <div className="bg-[#111111] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
           <div className="flex items-center gap-2 text-gray-400">
              <Camera size={18} />
              <h3 className="text-[10px] font-black uppercase tracking-widest">Tải ảnh Bill xác nhận</h3>
           </div>
           <div 
             onClick={() => document.getElementById('billInputRankUpgrade')?.click()}
             className={`aspect-video w-full rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer relative overflow-hidden transition-all ${billImage ? 'border-green-500 bg-green-500/5' : 'border-gray-800 bg-black hover:border-[#ff8c00]/30'}`}
           >
              <input id="billInputRankUpgrade" type="file" accept="image/*" hidden onChange={handleBillUpload} />
              {billImage ? (
                <>
                  <img src={billImage} className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                    <CheckCircle2 size={32} className="text-green-500 mb-2" />
                    <span className="text-[10px] font-black text-white">BILL ĐÃ TẢI LÊN</span>
                  </div>
                </>
              ) : (
                <>
                  {isUploading ? <div className="animate-spin border-4 border-[#ff8c00] border-t-transparent w-8 h-8 rounded-full" /> : <UploadCloud size={32} className="text-gray-700" />}
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Chọn ảnh Biên lai giao dịch</p>
                </>
              )}
           </div>
        </div>

        <button
          onClick={handleConfirmUpgrade}
          disabled={!billImage}
          className={`w-full py-5 rounded-[2.5rem] font-black text-sm tracking-[0.2em] transition-all mt-8 shadow-2xl ${billImage ? 'bg-[#ff8c00] text-black shadow-orange-950/40 active:scale-95' : 'bg-white/5 text-gray-600 cursor-not-allowed opacity-50'}`}
        >
          {billImage ? 'GỬI YÊU CẦU NÂNG CẤP' : 'VUI LÒNG ĐÍNH KÈM BILL'}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-black px-5 pb-32 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 px-1 pt-6">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-[#111111] border border-white/5 rounded-full flex items-center justify-center text-white active:scale-90 transition-all"
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Hạng & Hạn mức</h2>
      </div>

      <div className="space-y-4">
        {ranks.map((rank, idx) => {
          const isCurrent = user?.rank === rank.id;
          const isTargetPending = user?.pendingUpgradeRank === rank.id;
          const isHigherRank = idx > currentRankIndex;

          return (
            <div 
              key={rank.id}
              className={`bg-[#111111] rounded-[2.5rem] p-7 relative transition-all duration-300 border ${
                isCurrent ? 'border-[#ff8c00] shadow-[0_0_20px_rgba(255,140,0,0.1)]' : 'border-white/5'
              } ${!isCurrent && (currentRankIndex === ranks.length - 1 || hasPending) ? 'opacity-40' : 'opacity-100'}`}
            >
              {(isCurrent || isTargetPending) && (
                <div className={`absolute right-6 top-6 text-[9px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase ${
                  isCurrent ? 'bg-[#ff8c00] text-black' : 'bg-blue-500 text-white'
                }`}>
                  {isCurrent ? 'Hiện tại' : 'Đang duyệt'}
                </div>
              )}

              <div className="flex gap-5 mb-6">
                <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center">
                  {rank.icon}
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-2xl font-black text-white leading-tight tracking-tight">{rank.name}</h3>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Hạn mức: {rank.min} - {rank.max}</p>
                </div>
              </div>

              <div className="space-y-3">
                {rank.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isCurrent ? 'border-[#ff8c00]' : 'border-gray-800'}`}>
                      <CheckCircle2 size={10} className={isCurrent ? 'text-[#ff8c00]' : 'text-gray-800'} />
                    </div>
                    <span className={`text-xs font-bold ${isCurrent ? 'text-gray-200' : 'text-gray-500'}`}>{feature}</span>
                  </div>
                ))}
              </div>

              {isHigherRank && !hasPending && (
                <div className="mt-6 pt-6 border-t border-white/5">
                  <button 
                    onClick={() => handleOpenPayment(rank)}
                    className="w-full bg-[#ff8c00] text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-orange-950/20 active:scale-95 transition-all text-[11px] uppercase tracking-[0.15em]"
                  >
                    <ArrowUpCircle size={18} />
                    NÂNG CẤP NGAY
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RankLimits;