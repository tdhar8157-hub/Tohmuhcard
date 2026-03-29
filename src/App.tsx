/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  CreditCard, 
  Printer, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Home, 
  Edit, 
  Download, 
  Wallet, 
  LogIn, 
  UserPlus, 
  LogOut, 
  ChevronRight,
  FileText,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';

// --- Types ---

interface FamilyMember {
  id: number;
  name: string;
  gender: string;
  age: string;
  relation: string;
}

interface RationData {
  rationNo: string;
  nameHindi: string;
  nameEnglish: string;
  fatherName: string;
  districtHindi: string;
  districtEnglish: string;
  block: string;
  village: string;
  dealer: string;
  cardType: string;
  members: FamilyMember[];
}

type View = 'landing' | 'form' | 'preview';

// --- Constants ---

const INITIAL_RATION_DATA: RationData = {
  rationNo: '',
  nameHindi: '',
  nameEnglish: '',
  fatherName: '',
  districtHindi: '',
  districtEnglish: '',
  block: '',
  village: '',
  dealer: '',
  cardType: 'Green Card',
  members: [],
};

const DEMO_MEMBERS: FamilyMember[] = [
  { id: 1, name: 'हदीस मियाँ', gender: 'पु.', age: '77', relation: 'अन्य' },
  { id: 2, name: 'हसमवानु बीबी', gender: 'म.', age: '57', relation: 'स्वयं' },
  { id: 3, name: 'अब्दुल कुद्दुस', gender: 'पु.', age: '35', relation: 'बेटा' },
  { id: 4, name: 'परिषमा खातुन', gender: 'म.', age: '30', relation: 'बहु' },
  { id: 5, name: 'राजबानू खातून', gender: 'म.', age: '28', relation: 'बेटी' },
  { id: 6, name: 'सफाउद्दीन अंसारी', gender: 'पु.', age: '25', relation: 'बेटा' },
  { id: 7, name: 'इसरत जहां खातून', gender: 'म.', age: '13', relation: 'पोती' }
];

// --- Components ---

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [rationData, setRationData] = useState<RationData>(INITIAL_RATION_DATA);
  const [showModal, setShowModal] = useState<'login' | 'register' | 'deposit' | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [isPage1, setIsPage1] = useState(true);
  const [showColor, setShowColor] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  const cardRef = useRef<HTMLDivElement>(null);

  // --- Effects ---

  useEffect(() => {
    const handleResize = () => {
      if (view === 'preview') {
        const containerWidth = window.innerWidth - 32; // 16px padding on each side
        const cardWidth = 370;
        const gap = 60;
        const targetWidth = cardWidth * 2 + gap;
        
        if (containerWidth < targetWidth) {
          setScale(containerWidth / targetWidth);
        } else {
          setScale(1);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [view]);

  // --- Handlers ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
    setShowModal(null);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
    setShowModal(null);
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(depositAmount);
    if (!isNaN(amt) && amt > 0) {
      setWalletBalance(prev => prev + amt);
      setShowModal(null);
      setDepositAmount('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsUnlocked(false);
    setWalletBalance(0);
  };

  const fillDemoData = () => {
    setRationData({
      rationNo: '202000940048',
      nameHindi: 'हसनबाबू बीबी',
      nameEnglish: 'HASNBABU BIBI',
      fatherName: 'MAKBUL MIYAN',
      districtHindi: 'देवघर',
      districtEnglish: 'DEOGHAR',
      block: 'PALOJORI',
      village: 'POKHARIA',
      dealer: 'LAKHENDAR MURMU',
      cardType: 'Green Card',
      members: [...DEMO_MEMBERS],
    });
  };

  const addMember = () => {
    setRationData(prev => ({
      ...prev,
      members: [...prev.members, { id: Date.now(), name: '', gender: 'पु.', age: '', relation: '' }]
    }));
  };

  const removeMember = (id: number) => {
    setRationData(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== id)
    }));
  };

  const updateMember = (id: number, field: keyof FamilyMember, value: string) => {
    setRationData(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === id ? { ...m, [field]: value } : m)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rationData.rationNo.length !== 12) {
      setErrorMsg("Ration Card Number must be exactly 12 digits.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrorMsg(null);
    setShowColor(rationData.cardType !== 'White Card');
    setView('preview');
    setIsPage1(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const unlockPrint = () => {
    if (!isAuthenticated) {
      setShowModal('login');
      return;
    }
    if (isUnlocked) {
      window.print();
      return;
    }
    if (walletBalance >= 50) {
      if (confirm("Deduct ₹50 from your wallet to unlock full format and remove watermarks?")) {
        setWalletBalance(prev => prev - 50);
        setIsUnlocked(true);
      }
    } else {
      setShowModal('deposit');
    }
  };

  const handleDownloadImage = async () => {
    if (!isUnlocked) {
      alert("Please pay ₹50 to unlock before downloading.");
      return;
    }
    
    const wrapper = document.getElementById('card-scaling-wrapper');
    if (wrapper) {
      const originalTransform = wrapper.style.transform;
      const originalHeight = wrapper.style.height;
      
      try {
        // Set 1:1 scale for high quality capture
        wrapper.style.transform = 'scale(1)';
        wrapper.style.height = 'auto';

        const targetElement = isPage1 ? document.getElementById('page1-layout') : document.getElementById('page2-layout');
        if (!targetElement) throw new Error("Target element not found");

        const canvas = await html2canvas(targetElement, {
          scale: 3,
          useCORS: true,
          backgroundColor: '#ffffff'
        });

        // Restore original zoom
        wrapper.style.transform = originalTransform;
        wrapper.style.height = originalHeight;

        const link = document.createElement('a');
        link.download = `RationCard_${rationData.rationNo}_Page${isPage1 ? '1' : '2'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error(err);
        wrapper.style.transform = originalTransform;
        wrapper.style.height = originalHeight;
        alert("Could not generate image. Please try the Print option.");
      }
    }
  };

  // --- Render Helpers ---

  const renderLanding = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl w-full space-y-6 mx-auto p-4 md:p-6"
    >
      <div className="bg-white p-5 md:p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex items-start mb-6 md:mb-8">
          <div className="bg-blue-50 p-3 md:p-4 rounded-2xl mr-4 md:mr-5">
            <Printer className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Automatic Ration Card Print</h2>
            <p className="text-slate-500 text-sm md:text-base mt-1">System-generated ration card printing with auto-verification</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <button 
            onClick={() => setView('form')}
            className="bg-linear-to-br from-blue-500 to-blue-700 text-white p-5 md:p-6 rounded-2xl flex items-center justify-between hover:scale-[1.02] transition-all shadow-lg group"
          >
            <div className="flex items-center">
              <div className="bg-white/20 p-2 md:p-3 rounded-full mr-3 md:mr-4 group-hover:bg-white/30 transition-colors">
                <FileText className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg md:text-xl">Generate</div>
                <div className="text-xs md:text-sm opacity-90">Create New Ration Card</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <button className="bg-linear-to-br from-amber-400 to-amber-600 text-white p-5 md:p-6 rounded-2xl flex items-center justify-between hover:scale-[1.02] transition-all shadow-lg group">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 md:p-3 rounded-full mr-3 md:mr-4 group-hover:bg-white/30 transition-colors">
                <Printer className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg md:text-xl">Reprint</div>
                <div className="text-xs md:text-sm opacity-90">Print Existing Card</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <button className="bg-linear-to-br from-green-500 to-green-700 text-white p-5 md:p-6 rounded-2xl flex items-center justify-between hover:scale-[1.02] transition-all shadow-lg group">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 md:p-3 rounded-full mr-3 md:mr-4 group-hover:bg-white/30 transition-colors">
                <HelpCircle className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg md:text-xl">How To Print?</div>
                <div className="text-xs md:text-sm opacity-90">Step-by-step Guide</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <button className="bg-linear-to-br from-cyan-500 to-cyan-700 text-white p-5 md:p-6 rounded-2xl flex items-center justify-between hover:scale-[1.02] transition-all shadow-lg group">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 md:p-3 rounded-full mr-3 md:mr-4 group-hover:bg-white/30 transition-colors">
                <CreditCard className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg md:text-xl">Help / Support</div>
                <div className="text-xs md:text-sm opacity-90">Get Assistance</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      <div className="bg-white p-5 md:p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex items-start mb-6 md:mb-8">
          <div className="bg-blue-50 p-3 md:p-4 rounded-2xl mr-4 md:mr-5">
            <Printer className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Manual Instant Print</h2>
            <p className="text-slate-500 text-sm md:text-base mt-1">Quick printing without waiting • For urgent cases</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <button 
            onClick={() => setView('form')}
            className="bg-linear-to-br from-blue-500 to-blue-700 text-white p-5 md:p-6 rounded-2xl flex items-center justify-between hover:scale-[1.02] transition-all shadow-lg group relative overflow-hidden"
          >
            <div className="absolute top-2 left-4 bg-white text-blue-700 text-[10px] font-black px-2 py-0.5 rounded leading-none uppercase">New</div>
            <div className="flex items-center mt-2">
              <div className="bg-white/20 p-2 md:p-3 rounded-full mr-3 md:mr-4 group-hover:bg-white/30 transition-colors">
                <FileText className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg md:text-xl">Generate</div>
                <div className="text-xs md:text-sm opacity-90">Instant New Card</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 mt-2" />
          </button>

          <button className="bg-linear-to-br from-amber-400 to-amber-600 text-white p-5 md:p-6 rounded-2xl flex items-center justify-between hover:scale-[1.02] transition-all shadow-lg group">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 md:p-3 rounded-full mr-3 md:mr-4 group-hover:bg-white/30 transition-colors">
                <Printer className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg md:text-xl">Reprint</div>
                <div className="text-xs md:text-sm opacity-90">Print Existing Card</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderForm = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto w-full px-4 py-6 md:py-10"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-blue-50 p-6 md:p-8 border-b border-blue-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">You Print Ration Card</h1>
            <p className="text-gray-500 mt-2 text-base md:text-lg">Enter details to generate your printable ration card format</p>
          </div>
          <button 
            type="button" 
            onClick={fillDemoData} 
            className="bg-white text-blue-600 border-2 border-blue-200 px-6 py-3 rounded-xl hover:bg-blue-50 transition-all font-bold shadow-sm w-full md:w-auto"
          >
            Fill Demo Data
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8 md:space-y-10">
          {errorMsg && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 md:px-6 py-3 md:py-4 rounded-xl flex items-center gap-3 font-semibold text-sm md:text-base">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
              {errorMsg}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider">Ration Card Number</label>
              <input 
                type="text" 
                value={rationData.rationNo}
                onChange={e => setRationData(prev => ({ ...prev, rationNo: e.target.value }))}
                placeholder="202000940048" 
                required 
                maxLength={12} 
                className="w-full px-4 md:px-5 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl outline-hidden focus:border-blue-500 transition-colors text-base md:text-lg" 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider">Cardholder Name (Hindi)</label>
              <input 
                type="text" 
                value={rationData.nameHindi}
                onChange={e => setRationData(prev => ({ ...prev, nameHindi: e.target.value }))}
                placeholder="हसनबाबू बीबी" 
                required 
                className="w-full px-4 md:px-5 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl outline-hidden focus:border-blue-500 transition-colors text-base md:text-lg" 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider">Cardholder Name (English)</label>
              <input 
                type="text" 
                value={rationData.nameEnglish}
                onChange={e => setRationData(prev => ({ ...prev, nameEnglish: e.target.value.toUpperCase() }))}
                placeholder="HASNBABU BIBI" 
                required 
                className="w-full px-4 md:px-5 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl outline-hidden focus:border-blue-500 transition-colors text-base md:text-lg" 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider">Father/Husband Name</label>
              <input 
                type="text" 
                value={rationData.fatherName}
                onChange={e => setRationData(prev => ({ ...prev, fatherName: e.target.value.toUpperCase() }))}
                placeholder="MAKBUL MIYAN" 
                required 
                className="w-full px-4 md:px-5 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl outline-hidden focus:border-blue-500 transition-colors text-base md:text-lg" 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider">जिला का नाम (हिंदी में)</label>
              <select 
                value={rationData.districtHindi}
                onChange={e => setRationData(prev => ({ ...prev, districtHindi: e.target.value }))}
                required 
                className="w-full px-4 md:px-5 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl outline-hidden bg-white focus:border-blue-500 transition-colors text-base md:text-lg"
              >
                <option value="">जिला चुनें</option>
                <option value="बोकारो">बोकारो</option>
                <option value="देवघर">देवघर</option>
                <option value="धनबाद">धनबाद</option>
                <option value="रांची">रांची</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider">District Name (English)</label>
              <select 
                value={rationData.districtEnglish}
                onChange={e => setRationData(prev => ({ ...prev, districtEnglish: e.target.value }))}
                required 
                className="w-full px-4 md:px-5 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl outline-hidden bg-white focus:border-blue-500 transition-colors text-base md:text-lg"
              >
                <option value="">Select District</option>
                <option value="Bokaro">Bokaro</option>
                <option value="DEOGHAR">DEOGHAR</option>
                <option value="Dhanbad">Dhanbad</option>
                <option value="Ranchi">Ranchi</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider">Block</label>
              <input 
                type="text" 
                value={rationData.block}
                onChange={e => setRationData(prev => ({ ...prev, block: e.target.value.toUpperCase() }))}
                placeholder="PALOJORI" 
                required 
                className="w-full px-4 md:px-5 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl outline-hidden focus:border-blue-500 transition-colors text-base md:text-lg" 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider">Village / Ward</label>
              <input 
                type="text" 
                value={rationData.village}
                onChange={e => setRationData(prev => ({ ...prev, village: e.target.value.toUpperCase() }))}
                placeholder="POKHARIA" 
                required 
                className="w-full px-4 md:px-5 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl outline-hidden focus:border-blue-500 transition-colors text-base md:text-lg" 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider">Dealer Name</label>
              <input 
                type="text" 
                value={rationData.dealer}
                onChange={e => setRationData(prev => ({ ...prev, dealer: e.target.value.toUpperCase() }))}
                placeholder="LAKHENDAR MURMU" 
                required 
                className="w-full px-4 md:px-5 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl outline-hidden focus:border-blue-500 transition-colors text-base md:text-lg" 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider">Card Type</label>
              <select 
                value={rationData.cardType}
                onChange={e => setRationData(prev => ({ ...prev, cardType: e.target.value }))}
                required 
                className="w-full px-4 md:px-5 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl outline-hidden bg-white focus:border-blue-500 transition-colors text-base md:text-lg"
              >
                <option value="PH Card (Red/pink Card)">PH Card (Red/pink Card)</option>
                <option value="Green Card">Green Card</option>
                <option value="AAY Card (Yellow Card)">AAY Card (Yellow Card)</option>
                <option value="White Card">White Card</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center border-b-2 border-gray-100 pb-4">
              <h3 className="text-xl md:text-2xl font-black text-gray-800 flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-blue-600" /> Family Members
              </h3>
              <button 
                type="button" 
                onClick={addMember} 
                className="bg-blue-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-xl hover:bg-blue-700 transition-all font-bold flex items-center gap-2 shadow-lg text-sm md:text-base"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" /> Add Member
              </button>
            </div>
            
            <div className="overflow-x-auto -mx-6 md:mx-0">
              <table className="w-full min-w-[600px] md:min-w-0">
                <thead>
                  <tr className="text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                    <th className="pb-4 px-4">Name</th>
                    <th className="pb-4 px-4 w-24">Gender</th>
                    <th className="pb-4 px-4 w-24">Age</th>
                    <th className="pb-4 px-4 w-32">Relation</th>
                    <th className="pb-4 px-4 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rationData.members.map(member => (
                    <tr key={member.id} className="group">
                      <td className="py-4 px-4">
                        <input 
                          type="text" 
                          value={member.name}
                          onChange={e => updateMember(member.id, 'name', e.target.value)}
                          placeholder="Member Name" 
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-lg px-3 py-2 outline-hidden transition-all"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <select 
                          value={member.gender}
                          onChange={e => updateMember(member.id, 'gender', e.target.value)}
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-lg px-2 py-2 outline-hidden transition-all"
                        >
                          <option value="पु.">पु.</option>
                          <option value="म.">म.</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <input 
                          type="text" 
                          value={member.age}
                          onChange={e => updateMember(member.id, 'age', e.target.value)}
                          placeholder="Age" 
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-lg px-2 py-2 outline-hidden transition-all text-center"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <input 
                          type="text" 
                          value={member.relation}
                          onChange={e => updateMember(member.id, 'relation', e.target.value)}
                          placeholder="Relation" 
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-lg px-2 py-2 outline-hidden transition-all"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <button 
                          type="button" 
                          onClick={() => removeMember(member.id)} 
                          className="text-gray-300 hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-blue-700 transition-all transform active:scale-[0.98]"
          >
            Generate Print Format
          </button>
        </form>
      </div>
    </motion.div>
  );

  const getCardColor = () => {
    if (!showColor) return 'bg-white';
    switch (rationData.cardType) {
      case 'PH Card (Red/pink Card)': return 'bg-[#fecaca]'; // Light Red/Pink
      case 'AAY Card (Yellow Card)': return 'bg-[#fef08a]'; // Light Yellow
      case 'Green Card': return 'bg-[#4ade80]'; // Green
      default: return 'bg-white';
    }
  };

  const renderPreview = () => {
    const getTypeLabel = () => {
      switch (rationData.cardType) {
        case 'Green Card': return 'ग्रीन गृहस्थी योजना';
        case 'AAY Card (Yellow Card)': return 'अंत्योदय अन्न योजना';
        case 'PH Card (Red/pink Card)': return 'पूर्वविक्ताप्राप्त गृहस्थी योजना';
        default: return 'सफेद कार्ड';
      }
    };
    const typeLabel = getTypeLabel();
    const distEng = rationData.districtEnglish.toUpperCase();
    const cardColorClass = getCardColor();

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen py-10 px-4 flex flex-col items-center bg-[#f8f9fa] overflow-x-hidden"
      >
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-10 w-full max-w-md flex justify-center gap-6 print:hidden z-10 mx-auto">
          <button 
            onClick={() => setView('form')} 
            className="flex flex-col items-center justify-center gap-3 bg-blue-500 text-white p-8 rounded-2xl shadow-lg hover:bg-blue-600 transition-all flex-1"
          >
            <div className="bg-white/20 p-3 rounded-xl">
              <Home className="w-10 h-10" />
            </div>
            <span className="font-bold text-xl">Edit Details</span>
          </button>
          <button 
            onClick={unlockPrint} 
            className="flex flex-col items-center justify-center gap-3 bg-green-600 text-white p-8 rounded-2xl shadow-lg hover:bg-green-700 transition-all flex-1"
          >
            <div className="bg-white/20 p-3 rounded-xl">
              <Printer className="w-10 h-10" />
            </div>
            <span className="font-bold text-xl">Print Card</span>
          </button>
        </div>

        <div id="card-scaling-wrapper" className="flex flex-col items-center gap-10 origin-top text-black" style={{ transform: `scale(${scale})` }}>
          <div ref={cardRef} className="flex flex-col gap-10">
            {isPage1 ? (
              <div id="page1-layout" className="flex flex-row gap-8 items-center justify-center">
                {/* Front Left Panel */}
                <div 
                  className={`w-[370px] h-[585px] border-[3px] border-black flex flex-col relative overflow-hidden pt-8 px-6 shadow-lg print:shadow-none ${cardColorClass}`}
                >
                  <div className="text-center text-[13px] font-bold mb-4 leading-[1.4] tracking-wide text-black">
                    सामाजिक-आर्थिक एवं जाति जनगणना - २०२२<br/>के आलोक में पारिवारिक सूची
                  </div>
                  
                  <div className="border border-black w-[96%] mx-auto text-center py-1.5 mb-2 text-[10px] font-bold text-black">
                    RATION CARD NO. / राशन कार्ड संख्या : {rationData.rationNo}
                  </div>

                  <table className="w-[96%] mx-auto border-collapse border border-black text-[12px] font-semibold text-black">
                    <thead>
                      <tr>
                        <th className="border border-black py-1 px-1 w-8 text-center font-bold">क्र.</th>
                        <th className="border border-black py-1 px-1 text-center font-bold">पूरा नाम</th>
                        <th className="border border-black py-1 px-1 w-10 text-center font-bold">लिंग</th>
                        <th className="border border-black py-1 px-1 w-10 text-center font-bold">उम्र</th>
                        <th className="border border-black py-1 px-1 w-14 text-center font-bold">संबंध</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rationData.members.map((m, i) => (
                        <tr key={m.id}>
                          <td className="border border-black py-0.5 px-1 text-center font-bold">{i + 1}</td>
                          <td className="border border-black py-0.5 px-1 text-center font-bold whitespace-nowrap overflow-hidden text-ellipsis">{m.name}</td>
                          <td className="border border-black py-0.5 px-1 text-center font-bold">{m.gender}</td>
                          <td className="border border-black py-0.5 px-1 text-center font-bold">{m.age}</td>
                          <td className="border border-black py-0.5 px-1 text-center font-bold">{m.relation}</td>
                        </tr>
                      ))}
                      {Array.from({ length: Math.max(0, 7 - rationData.members.length) }).map((_, idx) => (
                        <tr key={`empty-${idx}`}>
                          <td className="border border-black py-0.5 px-1 h-[24px]"></td>
                          <td className="border border-black py-0.5 px-1"></td>
                          <td className="border border-black py-0.5 px-1"></td>
                          <td className="border border-black py-0.5 px-1"></td>
                          <td className="border border-black py-0.5 px-1"></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={5} className="border border-black py-1 px-4 font-bold text-left">
                          कुल व्यक्तियों की संख्या : {rationData.members.length}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={5} className="border border-black py-1 px-4 font-bold text-left h-7">
                          कार्डधारी का हस्ताक्षर :
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 rotate-[-35deg]">
                      <div className="text-5xl font-black text-red-600 border-[10px] border-red-600 p-6 whitespace-nowrap">PREVIEW MODE</div>
                    </div>
                  )}

                  <div className="text-center text-[9px] font-bold absolute bottom-8 left-0 right-0 tracking-wide leading-tight text-black">
                    HELP LINE NO:- 18003456598<br/>
                    IT SUPPORT BY NATIONAL INFORMATICS CENTRE ( NIC )
                  </div>
                </div>

                {/* Front Right Panel */}
                <div 
                  className={`w-[370px] h-[585px] border-[3px] border-black flex flex-col relative overflow-hidden text-center pt-3 px-8 shadow-lg print:shadow-none ${cardColorClass}`}
                >
                  <h2 className="text-[20px] font-bold tracking-wide text-black">राशन कार्ड</h2>
                  <p className="text-[14px] font-bold mt-3 text-black">खाद्य, सार्वजनिक वितरण एवं उपभोक्ता मामले विभाग</p>
                  
                  <div className="relative w-40 h-40 mx-auto my-6">
                    <img 
                      src="https://i.ibb.co/ZRZc1vfs/1280px-Jharkhand-Rajakiya-Chihna-svg.png" 
                      alt="Jharkhand Logo" 
                      className="object-contain w-full h-full" 
                      crossOrigin="anonymous"
                    />
                  </div>

                  <p className="text-[13px] font-bold mt-2 text-black">राष्ट्रीय खाद्य सुरक्षा अधिनियम</p>
                  <p className="text-[13px] font-bold mt-1 mb-4 text-black">{typeLabel} - {distEng}</p>

                  <div className="border border-black w-[90%] mx-auto text-center py-1.5 mt-2 text-[10px] font-bold text-black">
                    RATION CARD NO. / राशन कार्ड संख्या : {rationData.rationNo}
                  </div>

                  <p className="text-[13px] font-bold mt-5 mb-2 text-black">कार्डधारी का नाम : {rationData.nameHindi}</p>

                  {/* Barcode Simulation */}
                  <div className="mt-1 w-[200px] h-[30px] mx-auto opacity-95" style={{ background: 'repeating-linear-gradient(90deg, #000 0, #000 2px, transparent 2px, transparent 4px, #000 4px, #000 6px, transparent 6px, transparent 8px, #000 8px, #000 12px, transparent 12px, transparent 14px, #000 14px, #000 15px, transparent 15px, transparent 18px, #000 18px, #000 20px, transparent 20px, transparent 22px)' }}></div>

                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 rotate-[-35deg]">
                      <div className="text-5xl font-black text-blue-600 border-[10px] border-blue-600 p-6 whitespace-nowrap text-center">PAY TO PRINT<br/>WATERMARK</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div id="page2-layout" className="flex flex-row gap-8 items-center justify-center">
                {/* Back Left Panel */}
                <div 
                  className={`w-[370px] h-[585px] border-[3px] border-black flex flex-col relative overflow-hidden pt-8 px-0 shadow-lg print:shadow-none ${cardColorClass}`}
                >
                  <div className="border border-black w-[90%] mx-auto text-center py-1.5 mb-6 text-[10px] font-bold tracking-wide text-black">
                    RATION CARD NO. / राशन कार्ड संख्या : {rationData.rationNo}
                  </div>

                  <div className="w-[90%] mx-auto space-y-3 text-[11px] font-bold flex-1 text-black">
                    <div className="leading-tight">
                      <div>1. CARDHOLDER NAME : {rationData.nameEnglish}</div>
                      <div>2. कार्डधारी का नाम : {rationData.nameHindi}</div>
                    </div>

                    <div className="font-normal text-[11px] leading-tight text-justify pt-1 pb-1 text-black">
                      ( वरिष्ठ महिला का नाम )<br/>
                      ( गृहस्थी का मुखिया 18 वर्ष या उससे अधिक की महिला होगी | यदि 18 वर्ष से कम उम्र की महिलाएँ हो तो पुरुष गृहस्थी का मुखिया होगा | जैसे ही 18 वर्ष महिला की उम्र होगी वह गृहस्थी की मुखिया हो जायेगी )
                    </div>

                    <div>3. पिता / पति का नाम : <span className="text-[10px]">{rationData.fatherName}</span></div>

                    <div className="pt-1">
                      4. आवासीय पता :-
                      <div className="ml-10 font-bold mt-1.5 space-y-1 text-[11px]">
                        <div>गाँव / वार्ड : <span className="text-[10px]">{rationData.village}</span></div>
                        <div>प्रखंड / नगर-पालिका : <span className="text-[10px]">{rationData.block}</span></div>
                        <div>जिला का नाम : <span className="text-[10px]">{rationData.districtEnglish}</span></div>
                      </div>
                    </div>

                    <div className="pt-2">
                      5. लक्षित जन वितरण प्रणाली के दुकानदार का नाम / पता :-
                      <div className="ml-10 font-bold mt-1.5 space-y-1 text-[11px]">
                        <div>वितरण का नाम : <span className="text-[10px]">{rationData.dealer}</span></div>
                        <div>वितरण का पता : <span className="text-[10px]">{rationData.districtEnglish}</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between absolute bottom-12 left-[5%] right-[5%] font-bold text-[11px] text-black">
                    <span>निर्गत करने की तिथि</span>
                    <span>प्राधिकृत अधिकारी का हस्ताक्षर</span>
                  </div>

                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 rotate-[-35deg]">
                      <div className="text-5xl font-black text-red-600 border-[10px] border-red-600 p-6 whitespace-nowrap">PREVIEW MODE</div>
                    </div>
                  )}
                </div>

                {/* Back Right Panel */}
                <div 
                  className={`w-[370px] h-[585px] border-[3px] border-black flex flex-col relative overflow-hidden pt-8 px-0 shadow-lg print:shadow-none ${cardColorClass}`}
                >
                  <h3 className="text-center font-bold text-[14px] mb-6 underline underline-offset-2 text-black">कार्डधारियों के लिए आवश्यक सूचनाएँ</h3>
                  
                  <div className="w-[90%] mx-auto space-y-4 text-[10px] font-medium text-justify leading-snug tracking-tight text-black">
                    <div className="flex gap-2"><span className="shrink-0">१.</span><span>यह राशनकार्ड, कार्डधारी को निजी रुप से दिया गया है। इसे कार्डधारी के अलावा कोई और व्यवहार में नहीं ला सकता है। कार्ड को सुरक्षित रखना कार्डधारी की निजी ज़िम्मेदारी है।</span></div>
                    <div className="flex gap-2"><span className="shrink-0">२.</span><span>प्राधिकृत उचित मूल्य के दुकान से राशन लेने के समय कार्ड में राशन की मात्रा अवश्य अंकित करा लें। अपने कार्ड को दुकान में किसी भी हालत में नहीं छोड़ना चाहिये।</span></div>
                    <div className="flex gap-2"><span className="shrink-0">३.</span><span>किसी भी माह का राशन अगर उसी माह में नहीं प्राप्त किया जाये तो वह राशन अगले महीने में भी मिल सकता है।</span></div>
                    <div className="flex gap-2"><span className="shrink-0">४.</span><span>उचित मूल्य के दुकानदारों के विरुद्ध यदि कोई शिकायत हो तो उसकी सूचना उपायुक्त / उपविकास आयुक्त/ अनुमंडल पदाधिकारी / जिला आपूर्ति पदाधिकारी / पणन पदाधिकारी / प्रखण्ड आपूर्ति पदाधिकारी / आपूर्ति निरीक्षक को भेजी जा सकती है।</span></div>
                    <div className="flex gap-2"><span className="shrink-0">५.</span><span>इस कार्ड का निर्धारित मूल्य है। इसके खो जाने या अन्य कारणों से दुसरे कार्ड की आवश्यकता पड़ने पर इसकी आपूर्ति निर्धारित राशि प्राप्त होने के उपरान्त, उचित जांच के बाद अनुमंडल पदाधिकारी / प्रखण्ड आपूर्ति पदाधिकारी के कार्यालय से प्राप्त की जा सकेगी।</span></div>
                    <div className="flex gap-2"><span className="shrink-0">६.</span><span>कार्डधारी अगर अपने निवास स्थान को बदलने तो इसकी सूचना अनुमंडल पदाधिकारी / जिला आपूर्ति पदाधिकारी / प्रखण्ड आपूर्ति पदाधिकारी/ आपूर्ति निरीक्षक को तुरंत दे और अपने नये निवास के वार्ड की दुकान में अपना कार्ड स्थानान्तरित करवा ले ।</span></div>
                    <div className="flex gap-2"><span className="shrink-0">७.</span><span>जब कार्डधारी का अपने राशनिंग क्षेत्र / अपने क्षेत्र के बाहर जाना निश्चित हो जाय तब इस राशन कार्ड को तुरंत अनुमंडल पदाधिकारी / आपूर्ति कार्यालय में समर्पित कर एक प्रमाणपत्र ले लेना आवश्यक होगा अन्यथा अन्य स्थान में नया कार्ड नहीं बन सकेगा ।</span></div>
                  </div>

                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 rotate-[-35deg]">
                      <div className="text-5xl font-black text-blue-600 border-[10px] border-blue-600 p-6 whitespace-nowrap text-center">PAY TO PRINT<br/>WATERMARK</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 w-full max-w-[320px] mt-8 pb-12 print:hidden z-10 mx-auto">
            {!isUnlocked ? (
              <>
                <button 
                  onClick={unlockPrint} 
                  className="bg-amber-500 text-white py-3 rounded-lg font-bold text-[13px] shadow-md hover:bg-amber-600 transition-all"
                >
                  Pay ₹50 to Unlock (Regular)
                </button>
                <button 
                  onClick={unlockPrint} 
                  className="bg-cyan-400 text-white py-3 rounded-lg font-bold text-[13px] shadow-md hover:bg-cyan-500 transition-all"
                >
                  Pay ₹40 to Unlock (Deposit ₹100 for Discount)
                </button>
              </>
            ) : (
              <div className="bg-green-100 text-green-700 py-3 rounded-xl font-bold text-center flex items-center justify-center gap-2 border-2 border-green-200 mb-2">
                <CheckCircle2 className="w-5 h-5" /> Unlocked
              </div>
            )}
            <button 
              onClick={() => setIsPage1(!isPage1)} 
              className="bg-emerald-500 text-white py-3 rounded-lg font-bold text-[13px] shadow-md hover:bg-emerald-600 transition-all"
            >
              Show {isPage1 ? '2nd' : '1st'} Page
            </button>
            <button 
              onClick={() => setShowColor(true)} 
              className="bg-blue-500 text-white py-3 rounded-lg font-bold text-[13px] shadow-md hover:bg-blue-600 transition-all"
            >
              Enable Page Color
            </button>
            <button 
              onClick={() => setShowColor(false)} 
              className="bg-blue-400 text-white py-3 rounded-lg font-bold text-[13px] shadow-md hover:bg-blue-500 transition-all"
            >
              Disable Page Color
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderModals = () => (
    <AnimatePresence>
      {showModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center backdrop-blur-md p-4"
          onClick={() => setShowModal(null)}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowModal(null)} 
              className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {showModal === 'login' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-black text-gray-800">Login</h2>
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Email or Username</label>
                    <input type="text" required className="w-full px-5 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-hidden transition-colors" placeholder="Enter your email" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Password</label>
                    <input type="password" required className="w-full px-5 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-hidden transition-colors" placeholder="Enter password" />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 shadow-xl transition-all">Login to Account</button>
                  <p className="text-sm text-center text-gray-600">
                    Don't have an account? <button onClick={() => setShowModal('register')} className="text-blue-600 font-bold hover:underline">Register</button>
                  </p>
                </form>
              </div>
            )}

            {showModal === 'register' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-black text-gray-800">Register</h2>
                <form onSubmit={handleRegister} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Full Name</label>
                    <input type="text" required className="w-full px-5 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-hidden transition-colors" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Email</label>
                    <input type="email" required className="w-full px-5 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-hidden transition-colors" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Password</label>
                    <input type="password" required className="w-full px-5 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-hidden transition-colors" placeholder="Create a password" />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 shadow-xl transition-all">Create Account</button>
                  <p className="text-sm text-center text-gray-600">
                    Already have an account? <button onClick={() => setShowModal('login')} className="text-blue-600 font-bold hover:underline">Login</button>
                  </p>
                </form>
              </div>
            )}

            {showModal === 'deposit' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-black text-gray-800">Deposit to Wallet</h2>
                <div className="bg-gray-50 rounded-2xl p-6 text-center border-2 border-gray-100">
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Current Balance</p>
                  <p className="text-4xl font-black text-green-600 mt-1">₹{walletBalance}</p>
                </div>
                <form onSubmit={handleDeposit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Amount to Add (₹)</label>
                    <input 
                      type="number" 
                      value={depositAmount}
                      onChange={e => setDepositAmount(e.target.value)}
                      min="10" 
                      required 
                      className="w-full px-5 py-4 border-2 border-gray-100 rounded-xl focus:border-green-500 outline-hidden font-black text-2xl text-center" 
                      placeholder="e.g. 50" 
                    />
                  </div>
                  <div className="flex gap-3">
                    {[50, 100, 500].map(amt => (
                      <button 
                        key={amt}
                        type="button" 
                        onClick={() => setDepositAmount(amt.toString())} 
                        className="flex-1 border-2 border-gray-200 text-gray-600 font-black rounded-xl py-3 hover:bg-green-50 hover:border-green-500 hover:text-green-600 transition-all"
                      >
                        + ₹{amt}
                      </button>
                    ))}
                  </div>
                  <button type="submit" className="w-full bg-green-500 text-white font-black py-5 rounded-2xl hover:bg-green-600 shadow-xl transition-all text-lg">Secure Pay</button>
                </form>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans text-slate-900 flex flex-col">
      {/* Navbar */}
      <header className="bg-blue-600 text-white shadow-xl sticky top-0 z-[100] print:hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <button 
            onClick={() => setView('landing')}
            className="flex items-center gap-2 md:gap-3 font-black text-xl md:text-2xl tracking-tight hover:opacity-80 transition-opacity"
          >
            <div className="bg-white/20 p-1.5 md:p-2 rounded-xl">
              <CreditCard className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <span className="hidden min-[450px]:inline">PDS Print Card</span>
            <span className="min-[450px]:hidden">PDS</span>
          </button>
          
          <div className="flex items-center gap-2 md:gap-6">
            {!isAuthenticated ? (
              <div className="flex gap-2 md:gap-3">
                <button 
                  onClick={() => setShowModal('login')} 
                  className="hover:bg-white/20 px-3 md:px-6 py-2 md:py-2.5 rounded-xl font-bold transition-all flex items-center gap-1.5 md:gap-2 text-sm md:text-base"
                >
                  <LogIn className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden sm:inline">Login</span>
                </button>
                <button 
                  onClick={() => setShowModal('register')} 
                  className="bg-blue-700 border border-blue-400 hover:bg-blue-800 px-3 md:px-6 py-2 md:py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center gap-1.5 md:gap-2 text-sm md:text-base"
                >
                  <UserPlus className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden sm:inline">Register</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:gap-5">
                <div className="bg-blue-700 border border-blue-400 px-3 py-2 rounded-xl font-black text-sm shadow-inner flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-blue-200" />
                  <span className="text-white">Wallet:</span>
                  <span className="text-green-400">₹{walletBalance}</span>
                </div>
                <button 
                  onClick={() => setShowModal('deposit')} 
                  className="bg-green-500 hover:bg-green-600 px-3 md:px-6 py-2 md:py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center gap-1.5 md:gap-2 text-sm md:text-base"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden sm:inline">Deposit</span>
                </button>
                <button 
                  onClick={handleLogout} 
                  className="hover:bg-red-500 text-red-100 hover:text-white px-2 md:px-4 py-2 md:py-2.5 rounded-xl font-bold transition-all border border-transparent hover:border-red-400 flex items-center gap-1.5 md:gap-2 text-sm md:text-base"
                >
                  <LogOut className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {view === 'landing' && renderLanding()}
          {view === 'form' && renderForm()}
          {view === 'preview' && renderPreview()}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 print:hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white font-black text-xl">
              <CreditCard className="w-6 h-6" />
              <span>PDS Print Card</span>
            </div>
            <p className="text-sm leading-relaxed">
              Leading portal for digital ration card generation and printing services. 
              Secure, fast, and reliable system for all your PDS needs.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-white font-bold uppercase tracking-widest text-sm">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => setView('landing')} className="hover:text-white transition-colors">Home</button></li>
              <li><button onClick={() => setView('form')} className="hover:text-white transition-colors">Generate Card</button></li>
              <li><button className="hover:text-white transition-colors">Reprint Service</button></li>
              <li><button className="hover:text-white transition-colors">Support Center</button></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-white font-bold uppercase tracking-widest text-sm">Contact Us</h3>
            <p className="text-sm">Help Line: 1800-345-6598</p>
            <p className="text-sm">Email: support@pdsprint.in</p>
            <div className="flex gap-4 pt-2">
              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                <Home className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-xs">
          &copy; 2026 PDS Print Card Portal. All rights reserved. IT Support by NIC.
        </div>
      </footer>

      {/* Modals */}
      {renderModals()}
    </div>
  );
}
