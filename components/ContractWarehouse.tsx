
import React, { useState } from 'react';
import { User } from '../types';
import { FileText, Download, Eye, X, ShieldCheck } from 'lucide-react';
import ContractModal from './ContractModal';

interface ContractWarehouseProps {
  user: User | null;
}

interface Contract {
  id: string;
  amount: number;
  date: string;
}

const ContractWarehouse: React.FC<ContractWarehouseProps> = ({ user }) => {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  // System clean: Started with no contracts
  const contracts: Contract[] = [];

  return (
    <div className="w-full bg-black px-5 pb-24 space-y-6 animate-in fade-in duration-500">
      <div className="px-1 pt-4">
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Kho Hợp Đồng</h2>
      </div>

      <div className="space-y-4">
        {contracts.length === 0 ? (
          <div className="bg-[#111111]/50 border border-white/5 border-dashed rounded-[2rem] p-16 text-center">
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={24} className="text-gray-700" />
             </div>
             <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest leading-relaxed">
               Kho dữ liệu trống.<br/>Vui lòng thực hiện ký kết để lưu trữ.
             </p>
          </div>
        ) : (
          contracts.map((contract) => (
            <div 
              key={contract.id}
              className="bg-[#111111] border border-white/5 rounded-[2rem] p-6 flex items-center justify-between group active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#1a1a20] rounded-2xl flex items-center justify-center text-[#ff8c00]">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">{contract.id}</p>
                  <h4 className="text-base font-black text-white leading-none">HĐ VAY {contract.amount.toLocaleString()} đ</h4>
                  <p className="text-[10px] font-bold text-gray-500 mt-1">{contract.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="w-10 h-10 bg-[#1a1a20] rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                  <Download size={18} />
                </button>
                <button 
                  onClick={() => setSelectedContract(contract)}
                  className="w-10 h-10 bg-[#1a1a20] rounded-xl flex items-center justify-center text-gray-500 group-hover:bg-[#ff8c00] group-hover:text-black transition-all"
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedContract && (
        <ContractModal 
          contract={selectedContract} 
          user={user} 
          onClose={() => setSelectedContract(null)} 
        />
      )}
    </div>
  );
};

export default ContractWarehouse;
