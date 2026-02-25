import React, { useState, useRef, useEffect, useCallback } from 'react';
import { User, LoanRecord } from '../types';
import { Wallet, X, Eye, FileText, CheckCircle2, ShieldCheck, Eraser, ChevronLeft, CreditCard, Copy, Camera, UploadCloud, CircleHelp, Info, Award, Landmark, FileCheck, AlertCircle, ArrowDownToLine, ShieldAlert, ChevronRight } from 'lucide-react';
import ContractModal from './ContractModal';
import { compressImage } from '../utils';

interface LoanApplicationProps {
  user: User | null;
  loans: LoanRecord[];
  systemBudget: number;
  onApplyLoan: (amount: number, signature?: string) => void;
  onSettleLoan: (loanId: string, bill: string) => void;
  onBack: () => void;
  initialLoanToSettle?: LoanRecord | null;
  initialLoanToView?: LoanRecord | null;
}

enum LoanStep {
  LIST = 'LIST',
  SELECT_AMOUNT = 'SELECT_AMOUNT',
  CONTRACT = 'CONTRACT',
  SETTLE_DETAIL = 'SETTLE_DETAIL'
}

const SignaturePad: React.FC<{ onSign: (signature: string | null) => void }> = ({ onSign }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasContent, setHasContent] = useState(false);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d', { 
      desynchronized: true,
      willReadFrequently: false 
    });
    
    if (!ctx) return;
    
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#000000';
    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    initCanvas();
    const observer = new ResizeObserver(() => initCanvas());
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, [initCanvas]);

  const getCoords = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const getSignatureData = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasContent) return null;
    return canvas.toDataURL('image/png');
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    
    const coords = getCoords(e);
    isDrawing.current = true;
    lastPoint.current = coords;

    const ctx = ctxRef.current;
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
    
    if (!hasContent) {
      setHasContent(true);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current || !ctxRef.current || !lastPoint.current) return;
    e.preventDefault();

    const ctx = ctxRef.current;
    const currentPoint = getCoords(e);
    const midPoint = {
      x: lastPoint.current.x + (currentPoint.x - lastPoint.current.x) / 2,
      y: lastPoint.current.y + (currentPoint.y - lastPoint.current.y) / 2,
    };

    ctx.quadraticCurveTo(lastPoint.current.x, lastPoint.current.y, midPoint.x, midPoint.y);
    ctx.stroke();

    lastPoint.current = currentPoint;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDrawing.current) return;
    const ctx = ctxRef.current;
    if (ctx && lastPoint.current) {
      ctx.lineTo(lastPoint.current.x, lastPoint.current.y);
      ctx.stroke();
    }
    isDrawing.current = false;
    lastPoint.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    
    onSign(getSignatureData());
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas || !ctxRef.current) return;
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
    onSign(null);
  };

  return (
    <div className="relative aspect-[4/3] w-full bg-[#fdfdfd] border-2 border-dashed border-gray-200 rounded-3xl overflow-hidden touch-none shadow-inner">
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="w-full h-full cursor-crosshair touch-none"
        style={{ touchAction: 'none' }}
      />
      {!hasContent && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
          <span className="text-[10px] font-black text-black uppercase tracking-[0.2em]">Ký tại đây</span>
          <div className="w-10 h-px bg-black mt-2"></div>
        </div>
      )}
      {hasContent && (
        <button
          onClick={clear}
          className="absolute top-3 right-3 p-2 bg-white border border-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-all shadow-md active:scale-90"
        >
          <Eraser size={16} />
        </button>
      )}
    </div>
  );
};

const LoanApplication: React.FC<LoanApplicationProps> = ({ user, loans, systemBudget, onApplyLoan, onSettleLoan, onBack, initialLoanToSettle, initialLoanToView }) => {
  const [step, setStep] = useState<LoanStep>(initialLoanToSettle ? LoanStep.SETTLE_DETAIL : LoanStep.LIST);
  const [selectedAmount, setSelectedAmount] = useState<number>(1000000);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] = useState<LoanRecord | null>(initialLoanToView || null);
  const [settleLoan, setSettleLoan] = useState<LoanRecord | null>(initialLoanToSettle || null);
  const [billImage, setBillImage] = useState<string | null>(null);

  useEffect(() => {
    if (initialLoanToSettle) {
      setSettleLoan(initialLoanToSettle);
      setStep(LoanStep.SETTLE_DETAIL);
    } else if (initialLoanToView) {
      setSelectedContract(initialLoanToView);
      setStep(LoanStep.LIST);
    } else {
      setStep(LoanStep.LIST);
      setSettleLoan(null);
      setSelectedContract(null);
    }
  }, [initialLoanToSettle, initialLoanToView]);
  const [isUploading, setIsUploading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAllLoans, setShowAllLoans] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  const userAvailableBalance = user?.balance || 0;
  const actualMaxAllowed = Math.min(userAvailableBalance, systemBudget);
  const totalLimitCap = 10000000;

  const isSystemOutOfCapital = systemBudget < 1000000;

  const userLoansCountForId = loans.filter(l => l.userId === user?.id).length;
  const nextSequence = (userLoansCountForId + 1).toString().padStart(2, '0');
  const nextContractId = user ? `NDV-${user.id}-${nextSequence}` : 'NDV-TEMP';

  const getCalculatedDueDate = () => {
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

  const dueDate = getCalculatedDueDate();

  const handleConfirmSignature = () => {
    if (signatureData) {
      onApplyLoan(selectedAmount, signatureData);
      setStep(LoanStep.LIST);
    }
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

  const handleConfirmSettlement = () => {
    if (settleLoan && billImage) {
      onSettleLoan(settleLoan.id, billImage);
      
      // Nếu là khoản vay được truyền từ Dashboard, sau khi tất toán xong thì quay về Dashboard
      if (initialLoanToSettle) {
        onBack();
      } else {
        setStep(LoanStep.LIST);
      }
      
      setSettleLoan(null);
      setBillImage(null);
    } else {
      alert("Vui lòng tải lên ảnh Bill thanh toán");
    }
  };

  const getStatusColor = (status: string, isOverdue: boolean) => {
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

  const renderList = () => {
    // Logic giới hạn 5 khoản vay ĐANG NỢ:
    const activeLoans = loans.filter(l => !['ĐÃ TẤT TOÁN', 'BỊ TỪ CHỐI'].includes(l.status));
    const isLimitReached = activeLoans.length >= 5;
    
    // Hợp đồng mới nhất (để xét quy tắc N+1)
    const lastLoan = loans.length > 0 ? loans[0] : null;
    
    // Khoản vay trước đó phải là 'ĐANG NỢ' hoặc 'ĐÃ TẤT TOÁN' hoặc 'CHỜ TẤT TOÁN'
    const isPreviousLoanPending = lastLoan && !['ĐANG NỢ', 'ĐÃ TẤT TOÁN', 'CHỜ TẤT TOÁN'].includes(lastLoan.status);

    const today = new Date();
    const calculatedDueDate = getCalculatedDueDate();
    
    // Kiểm tra chu kỳ: Nếu có khoản vay ở chu kỳ cũ (khác ngày hạn dự kiến mới) thì phải tất toán hết mới được vay chu kỳ mới
    const hasActiveOldCycle = activeLoans.some(l => l.date !== calculatedDueDate);

    const hasOverdue = loans.some(l => {
      if (l.status !== 'ĐANG NỢ' && l.status !== 'CHỜ TẤT TOÁN') return false;
      const [d, m, y] = l.date.split('/').map(Number);
      const dueDateObj = new Date(y, m - 1, d);
      return dueDateObj < today;
    });

    const sortedLoans = [...loans].sort((a, b) => {
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

    const isApplyDisabled = hasOverdue || isSystemOutOfCapital || isPreviousLoanPending || isLimitReached || hasActiveOldCycle || (user?.balance || 0) <= 0;
    const displayedLoans = showAllLoans ? sortedLoans : sortedLoans.slice(0, 3);

    return (
      <div className="w-full space-y-6 animate-in fade-in duration-500 pb-12">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Khoản Vay</h2>
          <button 
            disabled={isApplyDisabled}
            onClick={() => {
              setSelectedAmount(Math.min(1000000, actualMaxAllowed));
              setStep(LoanStep.SELECT_AMOUNT);
            }}
            className={`font-black px-6 py-2.5 rounded-full text-[10px] tracking-widest transition-all shadow-lg ${
              isApplyDisabled 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50' 
                : 'bg-[#ff8c00] text-black active:scale-95 shadow-orange-950/20'
            }`}
          >
            {hasOverdue 
              ? 'NỢ XẤU - KHÓA' 
              : hasActiveOldCycle
                ? 'PHẢI TẤT TOÁN CHU KỲ CŨ'
                : isLimitReached 
                  ? 'TỐI ĐA 5 KHOẢN NỢ'
                  : isPreviousLoanPending 
                    ? 'CHỜ DUYỆT KHOẢN TRƯỚC' 
                    : isSystemOutOfCapital 
                      ? 'BẢO TRÌ VỐN' 
                      : 'ĐĂNG KÝ MỚI'}
          </button>
        </div>

        <div className="bg-[#111111] border border-white/5 rounded-[2.5rem] p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                <Wallet className="text-[#ff8c00]" size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Hạn mức khả dụng</p>
                <p className="text-2xl font-black text-white">{(userAvailableBalance).toLocaleString()} đ</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {isPreviousLoanPending && !hasOverdue && (
                <div className="flex items-center gap-1.5 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 animate-pulse">
                  <Info size={12} className="text-blue-500" />
                  <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Đang xét duyệt</span>
                </div>
              )}
              {isSystemOutOfCapital && !hasOverdue && !isPreviousLoanPending && (
                <div className="flex items-center gap-1.5 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20 animate-pulse">
                  <ShieldAlert size={12} className="text-orange-500" />
                  <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">Bảo trì vốn</span>
                </div>
              )}
            </div>
          </div>
          
          {(isPreviousLoanPending || isSystemOutOfCapital || isLimitReached || hasActiveOldCycle) && !hasOverdue && (
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-center px-1">
              {hasActiveOldCycle
                  ? 'Vui lòng tất toán hết các khoản vay chu kỳ cũ'
                  : isLimitReached
                    ? 'Đã đạt giới hạn 5 khoản nợ'
                    : isPreviousLoanPending 
                        ? 'Đợi duyệt khoản vay trước' 
                        : 'Hệ thống đang bảo trì vốn'}
            </p>
          )}

          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#ff8c00] transition-all duration-1000" 
              style={{ width: `${(userAvailableBalance / totalLimitCap) * 100}%` }}
            ></div>
          </div>
        </div>

        {selectedContract && (
          <ContractModal 
            contract={selectedContract} 
            user={user} 
            onClose={() => {
              setSelectedContract(null);
              if (initialLoanToView) onBack();
            }} 
          />
        )}
      </div>
    );
  };

  const renderSelectAmount = () => {
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value);
      if (val <= actualMaxAllowed) {
        setSelectedAmount(val);
      }
    };

    const isLimitedByBudget = systemBudget < userAvailableBalance;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="bg-[#111111] w-full max-w-sm rounded-[2.5rem] border border-white/10 p-8 space-y-10 relative shadow-2xl">
          <button onClick={() => setStep(LoanStep.LIST)} className="absolute right-6 top-6 text-gray-500 hover:text-white p-2">
            <X size={20} />
          </button>
          <div className="space-y-2 text-center">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Chọn số tiền vay</h3>
            <p className="text-4xl font-black text-[#ff8c00] tracking-tighter">
              {selectedAmount.toLocaleString()} <span className="text-lg">đ</span>
            </p>
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Phí 15% (Khấu trừ trực tiếp khi giải ngân)</p>
          </div>

          {isLimitedByBudget && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-in zoom-in duration-300 flex flex-col items-center text-center">
               <div className="flex items-center gap-2 mb-1">
                  <AlertCircle size={14} className="text-red-500" />
                  <span className="text-[9px] font-black text-red-500 uppercase">Nguồn vốn giới hạn</span>
               </div>
               <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">
                 Tối đa {systemBudget.toLocaleString()} đ. Hạn mức sẽ mở lại sau khi nạp vốn.
               </p>
            </div>
          )}

          <div className="space-y-8 px-2">
            <div className="relative pt-6 pb-2">
              <input
                type="range"
                min="1000000"
                max={actualMaxAllowed}
                step="1000000"
                value={selectedAmount}
                onChange={handleSliderChange}
                className="w-full h-2 bg-gray-800 rounded-full appearance-none cursor-pointer accent-[#ff8c00] focus:outline-none"
              />
              <div className="flex justify-between mt-6">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[9px] font-black text-gray-500 uppercase">Min</span>
                  <span className="text-[10px] font-black text-white">1.000.000 đ</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[9px] font-black uppercase ${isLimitedByBudget ? 'text-red-500' : 'text-orange-500/50'}`}>
                    {isLimitedByBudget ? 'Ngân sách hệ thống' : 'Hạn mức khả dụng'}
                  </span>
                  <span className={`text-[10px] font-black ${isLimitedByBudget ? 'text-red-500' : 'text-[#ff8c00]'}`}>
                    {actualMaxAllowed.toLocaleString()} đ
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            disabled={actualMaxAllowed < 1000000}
            onClick={() => { setStep(LoanStep.CONTRACT); setSignatureData(null); }}
            className={`w-full font-black py-5 rounded-[2rem] text-sm uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all ${
              actualMaxAllowed < 1000000 ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-[#ff8c00] text-black shadow-orange-950/20'
            }`}
          >
            {actualMaxAllowed < 1000000 ? 'KHÔNG ĐỦ NGÂN SÁCH' : 'TIẾP TỤC'}
          </button>
        </div>
      </div>
    );
  };

  const renderSettleDetail = () => {
    if (!settleLoan) return null;
    const totalPayment = settleLoan.amount + (settleLoan.fine || 0);
    const content = `TT-${settleLoan.id}`;

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
              onClick={() => {
                if (initialLoanToSettle) {
                  onBack();
                } else {
                  setStep(LoanStep.LIST);
                }
              }} 
              className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Tất toán khoản vay</h2>
          </div>
          <button onClick={() => setShowHelp(!showHelp)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showHelp ? 'bg-[#ff8c00] text-black shadow-lg shadow-orange-500/20' : 'bg-white/5 text-gray-400'}`}><CircleHelp size={22} /></button>
        </div>

        {showHelp && (
          <div className="bg-[#ff8c00]/5 border border-[#ff8c00]/20 rounded-[2rem] p-6 mb-8 animate-in fade-in zoom-in duration-300 space-y-4">
             <div className="flex items-center gap-2">
                <Info size={18} className="text-[#ff8c00]" />
                <span className="text-[11px] font-black text-[#ff8c00] uppercase tracking-widest">Hướng dẫn tất toán chi tiết</span>
             </div>
             <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-[#ff8c00] rounded-full flex items-center justify-center shrink-0 font-black text-[10px] text-black">1</div>
                  <p className="text-[10px] font-bold text-gray-300 leading-tight">
                    Sử dụng các nút sao chép để lấy <span className="text-[#ff8c00]">Số tài khoản</span>, <span className="text-[#ff8c00]">Nội dung</span> và <span className="text-[#ff8c00]">Tổng tiền</span> cần thanh toán.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-[#ff8c00] rounded-full flex items-center justify-center shrink-0 font-black text-[10px] text-black">2</div>
                  <p className="text-[10px] font-bold text-gray-300 leading-tight">
                    Mở ứng dụng Ngân hàng của bạn và thực hiện chuyển khoản chính xác các thông tin đã sao chép.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-[#ff8c00] rounded-full flex items-center justify-center shrink-0 font-black text-[10px] text-black">3</div>
                  <p className="text-[10px] font-bold text-gray-300 leading-tight">
                    Chụp ảnh màn hình <span className="text-white">Biên lai chuyển tiền</span> thành công để làm bằng chứng xác thực.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-[#ff8c00] rounded-full flex items-center justify-center shrink-0 font-black text-[10px] text-black">4</div>
                  <p className="text-[10px] font-bold text-gray-300 leading-tight">
                    Tải ảnh đã chụp lên phần <span className="text-white">Tải ảnh Bill xác nhận</span> bên dưới và nhấn Gửi xét duyệt.
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
                 <button onClick={() => copyToClipboard(content)} className="p-1 bg-white/5 rounded text-gray-400 hover:text-white transition-all"><Copy size={12} /></button>
              </div>
              <p className="text-xl font-black text-[#ff8c00] tracking-widest break-all">{content}</p>
           </div>
           
           <div className="flex flex-col gap-2 pl-4">
              <div className="flex justify-between items-center">
                 <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Số tiền</span>
                 <button onClick={() => copyToClipboard(totalPayment.toString())} className="p-1 bg-white/5 rounded text-gray-400 hover:text-white transition-all"><Copy size={12} /></button>
              </div>
              <p className="text-xl font-black text-[#ff8c00] tracking-tight">{totalPayment.toLocaleString()} đ</p>
           </div>
        </div>

        <div className="bg-[#111111] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
           <div className="flex items-center gap-2 text-gray-400">
              <Camera size={18} />
              <h3 className="text-[10px] font-black uppercase tracking-widest">Tải ảnh Bill xác nhận</h3>
           </div>
           <div 
             onClick={() => document.getElementById('billInputSettle')?.click()}
             className={`aspect-video w-full rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer relative overflow-hidden transition-all ${billImage ? 'border-green-500 bg-green-500/5' : 'border-gray-800 bg-black hover:border-[#ff8c00]/30'}`}
           >
              <input id="billInputSettle" type="file" accept="image/*" hidden onChange={handleBillUpload} />
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
          onClick={handleConfirmSettlement}
          disabled={!billImage}
          className={`w-full py-5 rounded-[2.5rem] font-black text-sm tracking-[0.2em] transition-all mt-8 shadow-2xl ${billImage ? 'bg-[#ff8c00] text-black shadow-orange-950/40 active:scale-95' : 'bg-white/5 text-gray-600 cursor-not-allowed opacity-50'}`}
        >
          {billImage ? 'GỬI XÉT DUYỆT NGAY' : 'VUI LÒNG ĐÍNH KÈM BILL'}
        </button>
      </div>
    );
  };

  const renderContract = () => (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="w-full p-6 flex items-center justify-between bg-black text-white border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-[#ff8c00]">
            <Award size={24} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest leading-none">Phác thảo hợp đồng</h3>
            <p className="text-[8px] font-bold text-gray-500 uppercase mt-1 tracking-tighter">KIỂM TRA & KÝ KẾT ĐIỆN TỬ</p>
          </div>
        </div>
        <button 
          onClick={() => setStep(LoanStep.SELECT_AMOUNT)}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-white active:scale-90 transition-all"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32">
        <div className="bg-white w-full rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-2xl border border-gray-100">
          
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-[0.03] rotate-[-35deg] select-none space-y-20">
            <span className="text-7xl font-black whitespace-nowrap">DRAFT FOR SIGNING</span>
            <span className="text-7xl font-black whitespace-nowrap">NDV FINANCIAL DOC</span>
          </div>

          <div className="flex flex-col items-center space-y-6 relative z-10">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-[#ff8c00] font-black text-xl shadow-lg border-2 border-orange-500/20">
                NDV
               </div>
               <div className="h-10 w-px bg-gray-200"></div>
               < Landmark size={32} className="text-gray-300" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-black tracking-tighter uppercase leading-tight">Hợp đồng vay tiêu dùng</h2>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em]">Số hợp đồng (Tạm tính): {nextContractId}</p>
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
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-gray-400 uppercase text-[8px] font-black tracking-widest">Bên cho vay (Bên A)</p>
                  <p className="text-[11px] text-black font-black uppercase">NDV MONEY FINANCIAL</p>
                </div>
                <div className="space-y-1 md:text-right">
                  <p className="text-gray-400 uppercase text-[8px] font-black tracking-widest">Bên vay (Bên B)</p>
                  <p className="text-[11px] text-black font-black uppercase">{user?.fullName || 'KHÁCH HÀNG'}</p>
                </div>
              </div>
            </section>

            {/* Điều 2: Đề xuất vay */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white font-black text-[9px]">02</div>
                <h4 className="text-[10px] font-black text-black uppercase tracking-widest">Nội dung đề xuất vay</h4>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-[9px] font-black text-gray-400 uppercase">Số tiền vay:</span>
                  <span className="text-lg font-black text-black">{selectedAmount.toLocaleString()} VNĐ</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-orange-500/5 px-4 rounded-xl border border-orange-500/10">
                  <div className="flex items-center gap-2">
                    <ArrowDownToLine size={14} className="text-orange-600" />
                    <span className="text-[9px] font-black text-orange-600 uppercase">Thực nhận:</span>
                  </div>
                  <span className="text-base font-black text-orange-700">{(selectedAmount * 0.85).toLocaleString()} VNĐ</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-gray-400 uppercase">Ngày giải ngân</p>
                    <p className="text-[10px] font-black text-black">{new Date().toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[8px] font-black text-gray-400 uppercase">Ngày đến hạn</p>
                    <p className="text-[10px] font-black text-orange-600 underline decoration-orange-200">{dueDate}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Điều 3: Lãi & Phí */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white font-black text-[9px]">03</div>
                <h4 className="text-[10px] font-black text-black uppercase tracking-widest">Lãi suất & Phí hồ sơ</h4>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3 bg-green-500/5 px-4 py-2 rounded-xl w-fit border border-green-500/10">
                  <FileCheck size={14} className="text-green-600" />
                  <span className="text-[9px] font-black text-green-700 uppercase">Lãi suất: 0% / Năm</span>
                </div>
                <p className="text-[10px] font-bold text-gray-600">
                  - Phí dịch vụ hồ sơ: <span className="text-black font-black">15%</span> (đã bao gồm phí định danh & bảo mật).
                </p>
              </div>
            </section>

            {/* Điều 4: Chế tài */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center text-white font-black text-[9px]">04</div>
                <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest">Chế tài vi phạm</h4>
              </div>
              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-600" />
                  <p className="text-red-600 font-black uppercase text-[9px]">Quy định chậm trả</p>
                </div>
                <ul className="text-[10px] font-bold text-gray-600 space-y-1 list-disc pl-4">
                  <li>Phí phạt chậm trả: <span className="font-black">0.1% / ngày</span> trễ hạn.</li>
                  <li>Tối đa phí phạt: 30% giá trị hợp đồng.</li>
                </ul>
              </div>
            </section>

            {/* Chữ ký */}
            <section className="space-y-6 pt-10 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col items-center space-y-4">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Đại diện (A)</p>
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 flex items-center justify-center opacity-80 scale-110 -rotate-12">
                      <div className="w-full h-full rounded-full border-[3px] border-red-600 border-dashed flex flex-col items-center justify-center flex-col text-red-600">
                        <span className="text-[7px] font-black uppercase leading-none">NDV GROUP</span>
                        <ShieldCheck size={20} className="my-1" />
                        <span className="text-[5px] font-black uppercase leading-none">CERTIFIED</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] font-black text-red-600 uppercase tracking-tighter">ĐÃ KÝ SỐ</p>
                </div>

                <div className="flex flex-col items-center space-y-4">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Người vay (B)</p>
                  <SignaturePad onSign={setSignatureData} />
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">KYC: {user?.fullName}</p>
                </div>
              </div>
            </section>
          </div>

          <div className="flex justify-center pt-10 mt-10 border-t border-gray-50">
             <p className="text-[7px] font-bold text-gray-300 uppercase tracking-[0.4em]">Draft V1.26 PRO - Authentic Signing Session</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-black flex gap-4 z-[110] border-t border-white/5 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
        <button 
          onClick={() => setStep(LoanStep.SELECT_AMOUNT)}
          className="flex-1 py-5 rounded-[2rem] border border-white/10 text-white font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
        >
          Hủy bỏ
        </button>
        <button 
          onClick={handleConfirmSignature}
          disabled={!signatureData}
          className={`flex-[1.5] py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl ${
            signatureData ? 'bg-[#ff8c00] text-black shadow-orange-950/20' : 'bg-white/5 text-gray-600 cursor-not-allowed opacity-50'
          }`}
        >
          {signatureData ? 'Ký & Gửi hồ sơ' : 'Vui lòng ký tên'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-black px-5 pt-4 overflow-x-hidden relative">
      {copyToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[1000] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-green-600 text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2">
            <CheckCircle2 size={16} />
            Đã sao chép thành công
          </div>
        </div>
      )}

      {step === LoanStep.LIST && renderList()}
      {step === LoanStep.SELECT_AMOUNT && (<>{renderList()}{renderSelectAmount()}</>)}
      {step === LoanStep.CONTRACT && renderContract()}
      {step === LoanStep.SETTLE_DETAIL && renderSettleDetail()}
    </div>
  );
};

export default LoanApplication;