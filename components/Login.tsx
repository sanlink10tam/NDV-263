
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (phone: string, password: string) => void;
  onNavigateRegister: () => void;
  error?: string | null;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateRegister, error }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPhoneTooltip, setShowPhoneTooltip] = useState(false);
  const [showPassTooltip, setShowPassTooltip] = useState(false);
  const [phoneErrorMsg, setPhoneErrorMsg] = useState('SỐ ZALO PHẢI ĐỦ 10 KÝ TỰ');

  // Reset tooltips when user types
  useEffect(() => {
    if (showPhoneTooltip) setShowPhoneTooltip(false);
    if (showPassTooltip) setShowPassTooltip(false);
  }, [phone, password]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    
    // Chặn nhập dư và ký tự lạ
    const val = rawVal.replace(/\D/g, '').slice(0, 10);
    setPhone(val);
  };

  const handleBlurPhone = () => {
    if (phone.length > 0 && phone.length < 10) {
      setPhoneErrorMsg('SỐ ZALO PHẢI ĐỦ 10 KÝ TỰ');
      setShowPhoneTooltip(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let hasError = false;

    // Check phone
    if (phone === '') {
      setPhoneErrorMsg('VUI LÒNG NHẬP SỐ ZALO');
      setShowPhoneTooltip(true);
      hasError = true;
    } else if (phone.length < 10) {
      setPhoneErrorMsg('SỐ ZALO PHẢI ĐỦ 10 KÝ TỰ');
      setShowPhoneTooltip(true);
      hasError = true;
    }

    // Check password
    if (password === '') {
      setShowPassTooltip(true);
      hasError = true;
    }

    if (hasError) return;
    
    onLogin(phone, password);
  };

  return (
    <div className="w-full min-h-screen bg-[#0a0a0a] flex flex-col items-center px-8 pt-16">
      <div className="mb-10 flex flex-col items-center">
        <div className="w-24 h-24 bg-[#ff8c00] rounded-[2rem] flex items-center justify-center orange-glow mb-6">
          <div className="w-16 h-16 border-8 border-black rounded-full flex items-center justify-center">
             <div className="w-3 h-8 bg-black rotate-45 translate-x-1 translate-y-1 rounded-full"></div>
             <div className="w-3 h-4 bg-black -rotate-45 -translate-x-1 -translate-y-1 rounded-full"></div>
          </div>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter mb-2">NDV Money</h1>
        <div className="border border-[#3d2c1c] px-4 py-1 rounded-full bg-[#1c120a]">
          <span className="text-[10px] font-bold text-[#ff8c00] uppercase tracking-widest">
            HỆ THỐNG XÁC THỰC V1.26
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-6 mt-8">
        {/* Zalo Input */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            <span className="text-[10px] font-black text-gray-600 uppercase">Zalo</span>
          </div>
          
          <input
            type="tel"
            inputMode="numeric"
            placeholder="SỐ ZALO"
            value={phone}
            onChange={handlePhoneChange}
            onBlur={handleBlurPhone}
            className={`w-full bg-[#16161a] border rounded-2xl py-5 pl-14 pr-4 text-sm font-bold text-white placeholder-gray-600 focus:outline-none transition-all ${
              showPhoneTooltip ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/5 focus:border-orange-500/30'
            }`}
          />
          
          {/* Tooltip Phone */}
          {showPhoneTooltip && (
            <div className="absolute -top-12 left-0 right-0 animate-in fade-in slide-in-from-bottom-2 duration-300 z-10">
              <div className="bg-red-500 text-white text-[10px] font-black py-2 px-4 rounded-xl flex items-center gap-2 shadow-2xl w-fit mx-auto relative">
                <AlertCircle size={14} />
                {phoneErrorMsg}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rotate-45"></div>
              </div>
            </div>
          )}
        </div>

        {/* Password Input */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
            <Lock size={18} />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="MẬT KHẨU"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full bg-[#16161a] border rounded-2xl py-5 pl-14 pr-12 text-sm font-bold text-white placeholder-gray-600 focus:outline-none transition-all ${
              showPassTooltip ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/5 focus:border-orange-500/30'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>

          {/* Tooltip Password */}
          {showPassTooltip && (
            <div className="absolute -top-12 left-0 right-0 animate-in fade-in slide-in-from-bottom-2 duration-300 z-10">
              <div className="bg-red-500 text-white text-[10px] font-black py-2 px-4 rounded-xl flex items-center gap-2 shadow-2xl w-fit mx-auto relative">
                <AlertCircle size={14} />
                VUI LÒNG NHẬP MẬT KHẨU
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rotate-45"></div>
              </div>
            </div>
          )}
        </div>

        {/* Global Error Message from System */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center justify-center gap-3 animate-in fade-in duration-300">
            <AlertCircle size={18} className="text-red-500" />
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-[#ff8c00] hover:bg-[#ffa500] text-black font-black text-lg py-5 rounded-3xl mt-4 transition-all active:scale-95 shadow-xl shadow-orange-900/20"
        >
          ĐĂNG NHẬP
        </button>
      </form>

      <button
        onClick={onNavigateRegister}
        className="mt-8 text-[11px] font-bold text-gray-500 uppercase tracking-widest hover:text-orange-500 transition-colors"
      >
        Chưa có tài khoản? <span className="text-gray-400">Đăng ký ngay</span>
      </button>

      <div className="mt-auto pb-10">
        <p className="text-[9px] font-bold text-gray-800 tracking-widest uppercase">Secured by NDV Money Financial Group</p>
      </div>
    </div>
  );
};

export default Login;
