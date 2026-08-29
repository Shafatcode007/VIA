import React, { useState, useEffect, useRef } from "react";
import {
  Home, ShoppingCart, Car, Search, Bell, User, MapPin, Star,
  Heart, ChevronRight, ArrowRight, Plus, Minus, X, MessageCircle,
  Send, Mic, Filter, Grid, List, Package, TrendingUp, Users,
  CheckCircle, Clock, AlertCircle, LogOut, Settings, Menu,
  Building2, Leaf, Zap, Shield, Phone, Mail, Eye, EyeOff,
  ChevronDown, BarChart3, Wallet, FileText, Upload, Camera,
  Navigation, Radio, ThumbsUp, RefreshCw, Download, Edit3,
  LayoutDashboard, BookOpen, Truck, DollarSign, PieChart,
  Smartphone, ShieldCheck, ChevronLeft, CreditCard, Banknote,
  XCircle, Zap as Lightning, ArrowDown
} from "lucide-react";

// ─── Constants & Types ────────────────────────────────────────────────────────
const VIA_GREEN = "#4DBE55";
const VIA_GREEN_LIGHT = "#edf7ee";
const SLATE = "#71776D";

type Page = "landing" | "auth" | "dashboard" | "housing" | "grocery" | "checkout" | "payment_status" | "admin" | "transport";
type Role = "resident" | "landlord" | "seller" | "driver" | "admin";
type AdminTab = "dashboard" | "users" | "listings" | "ledger";

// ─── Global AI Assistant Component ─────────────────────────────────────────────
function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your VIA Assistant. How can I help you today?", isBot: true }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { text: input, isBot: false }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { text: "I can certainly help you with that. Let me find the best options in Dhaka for you.", isBot: true }]);
      setIsTyping(false);
    }, 1500);
  };

  const toggleListen = () => {
    if (isListening) {
      setIsListening(false);
      setInput("Find fresh groceries near Mirpur...");
    } else {
      setIsListening(true);
      setInput("");
      setTimeout(() => setIsListening(false), 3000);
    }
  };

  return (
    <>
      {/* Floating FAB */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 bg-[#4DBE55] text-white rounded-full shadow-[0_4px_12px_rgba(77,190,85,0.4)] flex items-center justify-center hover:scale-105 transition-transform"
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
          {!isOpen && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-bold">
              2
            </span>
          )}
        </button>
      </div>

      {/* Expanded Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden z-50 flex flex-col border border-gray-100 animate-in slide-in-from-bottom-10 fade-in duration-200">
          {/* Header */}
          <div className="bg-[#4DBE55] p-4 text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Via Assistant</h4>
              <div className="flex items-center gap-1.5 text-xs text-white/80">
                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                Online
              </div>
            </div>
          </div>

          {/* Chat Body */}
          <div className="flex-1 p-4 h-64 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.isBot ? "bg-white border border-gray-200 text-gray-800 rounded-tl-sm" : "bg-[#4DBE55] text-white rounded-tr-sm"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-sm flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            
            {/* Quick Action Chips */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {["Find housing", "Order groceries", "Book transport"].map(chip => (
                  <button key={chip} onClick={() => setInput(chip)} className="bg-[#edf7ee] text-[#4DBE55] text-xs font-medium px-3 py-1.5 rounded-full border border-green-100 hover:bg-green-100 transition-colors">
                    {chip}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            {isListening && (
              <div className="flex items-center justify-center gap-2 mb-3 text-sm text-[#4DBE55] animate-pulse">
                <Loader /> Listening to your voice...
              </div>
            )}
            <div className={`flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border-2 transition-colors ${isListening ? 'border-[#4DBE55] bg-green-50' : 'border-transparent'}`}>
              <input
                type="text"
                placeholder={isListening ? "Listening..." : "Type a message..."}
                className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={toggleListen}
                className={`p-1.5 rounded-full transition-colors ${isListening ? 'bg-[#4DBE55] text-white animate-pulse shadow-[0_0_15px_rgba(77,190,85,0.5)]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Mic size={18} />
              </button>
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className={`p-1.5 rounded-full transition-colors ${input.trim() ? 'bg-[#4DBE55] text-white' : 'text-gray-300'}`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const Loader = () => (
  <svg className="animate-spin h-4 w-4 text-[#4DBE55]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// ─── Page 1: Authentication Page (2-Step) ────────────────────────────────────
function AuthPage({ setPage, setRole }: { setPage: (p: Page) => void, setRole: (r: Role) => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role>("resident");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const roles: { id: Role; label: string; icon: React.ReactNode }[] = [
    { id: "resident", label: "Resident", icon: <User size={20} /> },
    { id: "landlord", label: "Landlord", icon: <Building2 size={20} /> },
    { id: "seller", label: "Seller", icon: <Package size={20} /> },
    { id: "driver", label: "Driver", icon: <Car size={20} /> },
    { id: "admin", label: "Admin", icon: <Shield size={20} /> },
  ];

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow 1 char
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Simple auto-advance simulation
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleComplete = () => {
    setRole(selectedRole);
    setPage(selectedRole === "admin" ? "admin" : "dashboard");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
        
        {step === 1 ? (
          <div className="p-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to VIA</h2>
              <p className="text-gray-500 text-sm">Your all-in-one platform for Dhaka</p>
            </div>

            {/* Tab Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6 relative">
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${isLogin ? "left-1" : "left-[calc(50%+2px)]"}`}
              />
              <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 text-sm font-medium z-10 transition-colors ${isLogin ? "text-gray-900" : "text-gray-500"}`}>Login</button>
              <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 text-sm font-medium z-10 transition-colors ${!isLogin ? "text-gray-900" : "text-gray-500"}`}>Register</button>
            </div>

            {/* Role Selection */}
            {!isLogin && (
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Join As</label>
                <div className="grid grid-cols-5 gap-2">
                  {roles.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRole(r.id)}
                      className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border-2 transition-all duration-200 ${
                        selectedRole === r.id 
                          ? "border-[#4DBE55] bg-[#edf7ee] text-[#4DBE55] scale-105 shadow-sm" 
                          : "border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-500"
                      }`}
                    >
                      {r.icon}
                      <span className="text-[10px] font-medium">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Inputs */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone or Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input type="text" className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4DBE55] focus:border-transparent outline-none transition-all text-sm" placeholder="+880 1XXX-XXXXXX" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck size={18} className="text-gray-400" />
                  </div>
                  <input type={showPassword ? "text" : "password"} className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4DBE55] focus:border-transparent outline-none transition-all text-sm" placeholder="••••••••" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button onClick={() => setStep(2)} className="w-full bg-[#4DBE55] text-white py-3 rounded-xl font-medium hover:bg-[#3ea846] transition-colors shadow-sm mb-6">
              Continue
            </button>

            {/* Social Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500 text-xs">Or continue with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" /> Google
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-4 h-4" alt="Facebook" /> Facebook
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center animate-in slide-in-from-right-8 duration-300">
            <button onClick={() => setStep(1)} className="absolute top-6 left-6 text-gray-400 hover:text-gray-800">
              <ChevronLeft size={24} />
            </button>
            
            <div className="w-16 h-16 bg-[#edf7ee] rounded-full flex items-center justify-center mx-auto mb-6 text-[#4DBE55]">
              <Smartphone size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your number</h2>
            <p className="text-gray-500 text-sm mb-8 px-4">We sent a 6-digit verification code to <strong className="text-gray-800">+880 1711-223344</strong></p>
            
            <div className="flex justify-center gap-2 mb-8">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  className="w-11 h-12 text-center text-xl font-semibold border-2 border-gray-200 rounded-xl focus:border-[#4DBE55] focus:ring-0 outline-none transition-colors"
                />
              ))}
            </div>

            <button onClick={handleComplete} className="w-full bg-[#4DBE55] text-white py-3 rounded-xl font-medium hover:bg-[#3ea846] transition-colors shadow-sm mb-6">
              Verify & Continue
            </button>
            
            <p className="text-sm text-gray-500">
              Didn't receive code? <button className="text-[#4DBE55] font-medium hover:underline ml-1">Resend code</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page 2 & 3: Admin Panel Dashboard & Ledger Management ───────────────────
function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  const kpis = [
    { title: "Total Users", value: "48,291", trend: "+1,204 today", icon: <Users size={24} />, color: "bg-blue-50 text-blue-600" },
    { title: "Active Listings", value: "11,842", trend: "+84 this week", icon: <Home size={24} />, color: "bg-purple-50 text-purple-600" },
    { title: "Orders Today", value: "1,204", trend: "+12% vs yesterday", icon: <ShoppingCart size={24} />, color: "bg-orange-50 text-orange-600" },
    { title: "Revenue", value: "৳8.4M", trend: "+৳42K today", icon: <TrendingUp size={24} />, color: "bg-green-50 text-[#4DBE55]" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 mt-1">Platform overview and management</p>
        </div>
        <div className="flex items-center gap-2 bg-[#edf7ee] px-4 py-2 rounded-full border border-green-100">
          <span className="w-2.5 h-2.5 bg-[#4DBE55] rounded-full animate-pulse"></span>
          <span className="text-sm font-medium text-green-700">All systems operational</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 w-fit">
        {[
          { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
          { id: "users", label: "Users", icon: <Users size={16} /> },
          { id: "listings", label: "Listings", icon: <List size={16} /> },
          { id: "ledger", label: "Virtual Ledger", icon: <Wallet size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? "bg-[#4DBE55] text-white shadow-md" 
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-300">
        {activeTab === "dashboard" && <AdminTabDashboard kpis={kpis} />}
        {activeTab === "users" && <AdminTabUsers />}
        {activeTab === "listings" && <AdminTabListings />}
        {activeTab === "ledger" && <AdminTabLedger />}
      </div>
    </div>
  );
}

function AdminTabDashboard({ kpis }: { kpis: any[] }) {
  const pendingQueue = [
    { id: 1, name: "Rahim Ali", role: "Seller", title: "Rahim's Fresh Produce", img: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80" },
    { id: 2, name: "Sultana Begum", role: "Landlord", title: "3BR Flat in Dhanmondi", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=200&q=80" },
    { id: 3, name: "Karim Driver", role: "Driver", title: "Toyota Noah 2018", img: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=200&q=80" },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-full ${kpi.color}`}>{kpi.icon}</div>
              <span className="text-xs font-semibold text-[#4DBE55] bg-[#edf7ee] px-2 py-1 rounded-full">{kpi.trend}</span>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">{kpi.title}</p>
              <h3 className="text-3xl font-bold text-gray-900">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Verification Queue */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ShieldCheck className="text-[#4DBE55]" /> Pending Verification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pendingQueue.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden group">
              <div className="h-32 bg-gray-100 overflow-hidden">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h4>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1"><User size={14} /> {item.name}</span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">{item.role}</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-[#edf7ee] text-[#4DBE55] py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">Approve</button>
                  <button className="flex-1 bg-red-50 text-red-500 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminTabUsers() {
  const users = [
    { name: "Rafiqul Islam", email: "rafiq@example.com", role: "Resident", status: "Active", date: "Oct 24, 2025" },
    { name: "Nusrat Jahan", email: "nusrat@example.com", role: "Seller", status: "Active", date: "Oct 22, 2025" },
    { name: "Ahmed Zubair", email: "zubair@example.com", role: "Landlord", status: "Pending", date: "Oct 20, 2025" },
    { name: "Kamal Hossain", email: "kamal@example.com", role: "Driver", status: "Inactive", date: "Oct 18, 2025" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search users by name or email..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4DBE55] outline-none" />
        </div>
        <button className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
          <Filter size={16} /> Filter
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Joined Date</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#4DBE55] text-white flex items-center justify-center font-bold text-xs">{u.name.charAt(0)}</div>
                    <div>
                      <div className="font-medium text-gray-900">{u.name}</div>
                      <div className="text-gray-500 text-xs">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4"><span className="bg-gray-100 px-2.5 py-1 rounded-md text-xs font-medium text-gray-700">{u.role}</span></td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    u.status === 'Active' ? 'bg-[#edf7ee] text-[#4DBE55]' : 
                    u.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{u.date}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-[#4DBE55] mr-3"><Edit3 size={16} /></button>
                  <button className="text-gray-400 hover:text-red-500"><XCircle size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminTabListings() {
  return (
    <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
      <Grid size={48} className="mx-auto mb-4 text-gray-300" />
      <h3 className="text-lg font-medium text-gray-900">Listings Grid Placeholder</h3>
      <p className="text-sm mt-1">4-column grid of property/grocery cards would render here.</p>
    </div>
  );
}

// ─── LEDGER MANAGEMENT ────────────────────────────────────────────────────────
function AdminTabLedger() {
  const sellers = [
    { name: "Rahman Stores", balance: "৳24,600", orders: 142, status: "Active", reqPayout: false },
    { name: "Bhai Bhai Grocery", balance: "৳18,250", orders: 89, status: "Payout Req.", reqPayout: true },
    { name: "Fresh Mart Hub", balance: "৳4,100", orders: 24, status: "Active", reqPayout: false },
    { name: "Mayer Doa Enterprise", balance: "৳62,400", orders: 310, status: "Payout Req.", reqPayout: true },
  ];

  const transactions = [
    { date: "Today, 10:42 AM", id: "#ORD-9921", sellers: "Rahman Stores, Fresh Mart", amt: "৳1,850", status: "Completed" },
    { date: "Today, 09:15 AM", id: "#ORD-9920", sellers: "Bhai Bhai Grocery", amt: "৳420", status: "Completed" },
    { date: "Yesterday, 08:30 PM", id: "#ORD-9919", sellers: "Mayer Doa Enterprise", amt: "৳3,100", status: "Pending" },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Overview Cards */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-gray-900">Virtual Ledger & Payouts</h2>
        <button className="flex items-center gap-2 text-sm bg-white border border-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#4DBE55] to-[#3aa142] text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <Wallet className="absolute right-[-10px] bottom-[-10px] text-white/10" size={100} />
          <p className="text-white/80 text-sm font-medium mb-1">Total Ledger Balance</p>
          <h3 className="text-3xl font-bold">৳1.24M</h3>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-sm font-medium mb-1 flex items-center gap-1.5"><Clock size={16} className="text-amber-500"/> Pending Payouts</p>
          <h3 className="text-2xl font-bold text-gray-900">৳84,200</h3>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-sm font-medium mb-1 flex items-center gap-1.5"><PieChart size={16} className="text-blue-500"/> Platform Commission</p>
          <h3 className="text-2xl font-bold text-gray-900">৳12,800</h3>
        </div>
      </div>

      {/* Visual Ledger Distribution Diagram */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Payment Flow Architecture</h3>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 max-w-4xl mx-auto">
          
          {/* Node 1 */}
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-sm border border-blue-100">
              <User size={28} />
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 text-sm">Customer</div>
              <div className="text-xs text-gray-500">Single Payment</div>
            </div>
          </div>

          {/* Line 1 */}
          <div className="flex-1 h-1 bg-gradient-to-r from-blue-200 to-[#4DBE55] relative hidden md:block">
            <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-white px-2 text-xs font-medium text-gray-500 rounded-full border border-gray-200">Processing</div>
            <div className="h-full bg-[#4DBE55] w-1/2 animate-pulse"></div>
          </div>

          {/* Node 2 */}
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="w-20 h-20 bg-[#edf7ee] text-[#4DBE55] rounded-2xl flex items-center justify-center shadow-md border-2 border-[#4DBE55] relative">
              <Wallet size={32} />
              <span className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-0.5"><CheckCircle size={14}/></span>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900 text-sm">VIA Ledger</div>
              <div className="text-xs text-[#4DBE55] font-medium">Auto-split engine</div>
            </div>
          </div>

          {/* Lines splitting */}
          <div className="flex-1 hidden md:flex flex-col justify-center relative w-32 h-32">
            <svg className="w-full h-full text-green-200" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M 0,50 L 50,50 L 100,20" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4" />
              <path d="M 0,50 L 50,50 L 100,50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4" />
              <path d="M 0,50 L 50,50 L 100,80" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4" />
            </svg>
          </div>

          {/* Node 3 (Destinations) */}
          <div className="flex flex-col gap-4 z-10">
            <div className="flex items-center gap-3 bg-white border border-gray-200 p-2.5 rounded-xl shadow-sm min-w-[160px]">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Package size={16}/></div>
              <div>
                <div className="text-xs font-semibold">Seller A</div>
                <div className="text-[10px] text-gray-500">Product Cost</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white border border-gray-200 p-2.5 rounded-xl shadow-sm min-w-[160px]">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Package size={16}/></div>
              <div>
                <div className="text-xs font-semibold">Seller B</div>
                <div className="text-[10px] text-gray-500">Product Cost</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white border border-gray-200 p-2.5 rounded-xl shadow-sm min-w-[160px]">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Car size={16}/></div>
              <div>
                <div className="text-xs font-semibold">Driver Fee</div>
                <div className="text-[10px] text-gray-500">Delivery Charge</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seller Balance Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Seller Balances</h3>
            <button className="text-sm text-[#4DBE55] font-medium hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Seller</th>
                  <th className="px-5 py-3 font-medium">Balance</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sellers.map((s, i) => (
                  <tr key={i} className="hover:bg-gray-50 group">
                    <td className="px-5 py-4 font-medium text-gray-900">{s.name}</td>
                    <td className="px-5 py-4 font-bold">{s.balance}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        s.reqPayout ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                        s.reqPayout 
                          ? 'border-[#4DBE55] bg-[#4DBE55] text-white hover:bg-[#3ea846]' 
                          : 'border-gray-200 text-gray-500 hover:border-[#4DBE55] hover:text-[#4DBE55]'
                      }`}>
                        Pay Out
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction History Panel */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Recent Transactions</h3>
            <Filter size={16} className="text-gray-400" />
          </div>
          <div className="p-3 flex-1 overflow-y-auto space-y-3">
            {transactions.map((t, i) => (
              <div key={i} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-gray-900 text-sm">{t.amt}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    t.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {t.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-2">Order {t.id} • {t.date}</div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white p-1.5 rounded border border-gray-200">
                  <Package size={12} className="text-gray-400" /> {t.sellers}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-100">
            <button className="w-full py-2 text-sm text-[#4DBE55] font-medium hover:bg-green-50 rounded-lg transition-colors">View All History</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Optimized Checkout & Payment ─────────────────────────────────────────────
function CheckoutPage({ setPage }: { setPage: (p: Page) => void }) {
  const [method, setMethod] = useState("bKash");

  const handlePay = (status: "success" | "failure") => {
    // In a real app we'd route via router, here we set page state and pass via global store or context. 
    // We'll just fake it by rendering the status page directly or changing main state.
    // Let's use a custom event or just modify the generic setPage since we can't easily pass props down through the main switch without refactoring.
    // For prototype: we'll use local storage to pass the status, or a global variable.
    (window as any)._paymentStatus = status;
    setPage("payment_status");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32 md:pb-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setPage("grocery")} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"><ChevronLeft size={20}/></button>
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Optimization Banner */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 shadow-sm">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-full mt-0.5">
              <Lightning size={18} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 text-sm mb-1">Smart Tip: Save ৳45 on Delivery!</h4>
              <p className="text-amber-700 text-xs mb-3">You have items from 3 different sellers. Buy similar items from <strong>Rahman Stores</strong> to consolidate shipping.</p>
              <div className="flex gap-2">
                <button className="bg-amber-600 text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-amber-700">Apply Tip</button>
                <button className="bg-white text-amber-700 text-xs font-medium px-4 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-50">Keep Current</button>
              </div>
            </div>
          </div>

          {/* Delivery Details placeholder */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Delivery Address</h3>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <MapPin className="text-[#4DBE55] mt-0.5" size={20} />
              <div>
                <p className="font-medium text-sm text-gray-900">Home</p>
                <p className="text-xs text-gray-500">Apt 4B, House 12, Road 5, Dhanmondi, Dhaka</p>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Payment Method</h3>
            <div className="space-y-3">
              {[
                { id: "bKash", icon: <CreditCard className="text-pink-600"/>, label: "bKash Mobile Menu" },
                { id: "cod", icon: <Banknote className="text-green-600"/>, label: "Cash on Delivery" },
                { id: "card", icon: <CreditCard className="text-blue-600"/>, label: "Credit / Debit Card" },
              ].map(m => (
                <label key={m.id} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${method === m.id ? 'border-[#4DBE55] bg-[#edf7ee]' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    {m.icon}
                    <span className="font-medium text-sm text-gray-900">{m.label}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === m.id ? 'border-[#4DBE55]' : 'border-gray-300'}`}>
                    {method === m.id && <div className="w-2.5 h-2.5 bg-[#4DBE55] rounded-full"></div>}
                  </div>
                  <input type="radio" name="payment" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="hidden" />
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Order Summary & Virtual Ledger Info Box */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm text-gray-600 mb-4 border-b border-gray-100 pb-4">
              <div className="flex justify-between"><span>Items (4)</span><span>৳1,450</span></div>
              <div className="flex justify-between"><span>Delivery Fee (3 Sellers)</span><span>৳135</span></div>
              <div className="flex justify-between text-[#4DBE55]"><span>Platform Discount</span><span>-৳50</span></div>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-900 mb-6">
              <span>Total</span><span>৳1,535</span>
            </div>

            {/* Virtual Ledger Info Box */}
            <div className="mb-6 p-3 rounded-xl border-2 border-[#edf7ee] bg-[#f7faf7] flex items-start gap-3 relative group">
              <ShieldCheck className="text-[#4DBE55] shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs font-semibold text-gray-900 mb-0.5">Single Payment, Multiple Sellers</p>
                <p className="text-[10px] text-gray-500 leading-tight">Pay once securely. VIA's Virtual Ledger automatically distributes the funds to all 3 sellers and the delivery driver.</p>
              </div>
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-[10px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Guaranteed by VIA Escrow. Funds are released only after successful delivery.
              </div>
            </div>

            <button onClick={() => handlePay("success")} className="w-full bg-[#4DBE55] text-white py-3.5 rounded-xl font-bold shadow-[0_4px_14px_rgba(77,190,85,0.4)] hover:bg-[#3ea846] hover:-translate-y-0.5 transition-all mb-3">
              Pay ৳1,535
            </button>
            <button onClick={() => handlePay("failure")} className="w-full bg-white text-gray-400 py-2 rounded-xl text-xs font-medium hover:text-red-500 transition-colors">
              Simulate Failure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Success & Failure States ─────────────────────────────────────────
function PaymentStatusPage({ setPage }: { setPage: (p: Page) => void }) {
  const status = (window as any)._paymentStatus === "failure" ? "failure" : "success";

  if (status === "failure") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <XCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
        <p className="text-gray-500 text-sm max-w-sm mb-8">We couldn't process your payment via bKash. Please check your balance or try a different method.</p>
        
        {/* AI Recovery Bubble */}
        <div className="bg-[#edf7ee] border border-green-100 p-4 rounded-2xl rounded-tl-sm flex items-start gap-3 max-w-sm mb-8 shadow-sm">
          <div className="w-8 h-8 bg-[#4DBE55] rounded-full flex items-center justify-center shrink-0">
            <Zap size={16} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm text-gray-800 font-medium mb-1">Would you like to try Cash on Delivery instead?</p>
            <p className="text-xs text-gray-500">I can update your order instantly.</p>
          </div>
        </div>

        <div className="flex gap-4 w-full max-w-sm">
          <button onClick={() => setPage("checkout")} className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            Try Again
          </button>
          <button onClick={() => setPage("success")} className="flex-1 bg-[#4DBE55] text-white py-3 rounded-xl font-medium hover:bg-[#3ea846] transition-colors shadow-sm">
            Switch to COD
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 max-w-md mx-auto animate-in slide-in-from-bottom-8 duration-500">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-[#4DBE55] blur-xl opacity-20 rounded-full animate-pulse"></div>
        <div className="w-24 h-24 bg-[#4DBE55] text-white rounded-full flex items-center justify-center relative shadow-[0_8px_30px_rgba(77,190,85,0.3)]">
          <CheckCircle size={48} />
        </div>
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
      <p className="text-gray-500 text-sm mb-8">Order #ORD-9922 has been placed successfully.</p>

      {/* Order Timeline */}
      <div className="w-full bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6">
        <div className="flex justify-between items-center relative">
          <div className="absolute top-1/2 left-4 right-4 h-1 bg-gray-100 -translate-y-1/2 z-0">
            <div className="w-1/3 h-full bg-[#4DBE55]"></div>
          </div>
          
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="w-8 h-8 rounded-full bg-[#4DBE55] text-white flex items-center justify-center border-4 border-white"><CheckCircle size={14}/></div>
            <span className="text-[10px] font-bold text-gray-900">Confirmed</span>
          </div>
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="w-8 h-8 rounded-full bg-white border-2 border-[#4DBE55] text-[#4DBE55] flex items-center justify-center"><Package size={14}/></div>
            <span className="text-[10px] font-bold text-gray-500">Preparing</span>
          </div>
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-gray-300 flex items-center justify-center"><Truck size={14}/></div>
            <span className="text-[10px] font-bold text-gray-400">In Transit</span>
          </div>
        </div>
      </div>

      {/* Driver Info Mock */}
      <div className="w-full bg-[#edf7ee] border border-green-100 p-4 rounded-2xl mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80" alt="Driver" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
          <div>
            <p className="text-sm font-bold text-gray-900">Karim (Driver)</p>
            <p className="text-xs text-[#4DBE55] flex items-center gap-1"><Star size={12} className="fill-current"/> 4.9 • On the way</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 bg-white text-[#4DBE55] rounded-full flex items-center justify-center shadow-sm"><MessageCircle size={18}/></button>
          <button className="w-10 h-10 bg-[#4DBE55] text-white rounded-full flex items-center justify-center shadow-sm"><Phone size={18}/></button>
        </div>
      </div>

      <button onClick={() => setPage("dashboard")} className="w-full bg-white border-2 border-[#4DBE55] text-[#4DBE55] py-3.5 rounded-xl font-bold hover:bg-green-50 transition-colors">
        Track Order
      </button>
    </div>
  );
}

// ─── Shared UI & Stubs for the rest of the app to compile ────────────────────
function Navbar({ page, setPage }: { page: Page, setPage: (p: Page) => void }) {
  if (page === "auth" || page === "payment_status") return null;

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage("landing")}>
          <div className="font-[Poppins] w-8 h-8 bg-[#4DBE55] rounded-lg flex items-center justify-center text-white font-bold text-xl italic tracking-tighter">V</div>
          <span className="font-[Poppins] font-bold text-xl tracking-tight text-gray-900">VIA</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => setPage("dashboard")} className="text-sm font-medium text-gray-600 hover:text-[#4DBE55]">Dashboard</button>
          <button onClick={() => setPage("housing")} className="text-sm font-medium text-gray-600 hover:text-[#4DBE55]">Housing</button>
          <button onClick={() => setPage("grocery")} className="text-sm font-medium text-gray-600 hover:text-[#4DBE55]">Grocery</button>
          <button onClick={() => setPage("admin")} className="text-sm font-medium text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1 rounded-full"><Shield size={14} className="inline mr-1"/>Admin</button>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setPage("checkout")} className="relative p-2 text-gray-600 hover:text-[#4DBE55] hover:bg-gray-50 rounded-full">
            <ShoppingCart size={20} />
            <span className="absolute top-0 right-0 w-4 h-4 bg-[#4DBE55] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">4</span>
          </button>
          <button onClick={() => setPage("auth")} className="hidden md:flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
            Login
          </button>
          <button className="md:hidden text-gray-600"><Menu size={24} /></button>
        </div>
      </div>
    </nav>
  );
}

// Lightweight stubs for existing pages to ensure the app compiles as a single file
function LandingPage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-[#edf7ee] to-white">
      <h1 className="font-[Poppins] text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Dhaka's Super App</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-lg">One unified platform for Housing, Groceries, and Transport powered by smart virtual ledgers.</p>
      <div className="flex gap-4">
        <button onClick={() => setPage("auth")} className="font-[Poppins] bg-[#4DBE55] text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-green-200 hover:-translate-y-1 transition-all">Get Started</button>
        <button onClick={() => setPage("grocery")} className="font-[Poppins] bg-white text-gray-800 px-8 py-3.5 rounded-full font-bold shadow-sm border border-gray-200 hover:bg-gray-50 transition-all">Explore Services</button>
      </div>
    </div>
  );
}

function StubPage({ title, icon, onAction, actionText }: { title: string, icon: any, onAction: () => void, actionText: string }) {
  return (
    <div className="p-12 text-center flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-gray-300 mb-4">{icon}</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title} Prototype</h2>
      <p className="text-gray-500 mb-6">Navigated to the {title} section successfully.</p>
      <button onClick={onAction} className="bg-[#4DBE55] text-white px-6 py-2 rounded-xl font-medium">{actionText}</button>
    </div>
  );
}

// ─── User Dashboard Component ──────────────────────────────────────────────────
function DashboardPage({ setPage }: { setPage: (p: Page) => void }) {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-[Poppins] font-bold text-gray-900 flex items-center gap-2 tracking-tight">
            Good morning, Rashed Khan <span className="text-2xl">☀️</span>
          </h1>
          <div className="mt-2 flex items-center">
            <span className="bg-[#edf7ee] text-[#4DBE55] px-3 py-1 rounded-full text-xs font-semibold tracking-wide border border-green-100 flex items-center gap-1.5">
              <User size={12} strokeWidth={2.5} /> Resident
            </span>
          </div>
        </div>
        <button className="p-3 text-[#71776D] hover:bg-gray-50 hover:text-[#4DBE55] rounded-full transition-colors bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <Settings size={20} />
        </button>
      </div>

      {/* 2. Tab Navigation */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 bg-white p-1.5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 w-fit">
        {["Overview", "Listings", "Orders", "Analytics"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab
                ? "bg-[#4DBE55] text-white shadow-md shadow-green-200/50"
                : "text-[#71776D] hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Heart size={20} />} 
          title="Saved listings" 
          value="7" 
          trend="+2 new" 
          trendPositive={true} 
        />
        <StatCard 
          icon={<ShoppingCart size={20} />} 
          title="Orders this month" 
          value="14" 
          trend="৳3,420 spent" 
          trendPositive={false} 
        />
        <StatCard 
          icon={<Car size={20} />} 
          title="Trips taken" 
          value="23" 
          trend="৳1,840 paid" 
          trendPositive={false} 
        />
        <StatCard 
          icon={<Star size={20} />} 
          title="Avg. rating given" 
          value="4.6" 
          trend="Top 10%" 
          trendPositive={true} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 4. Quick Actions */}
        <div className="bg-white p-6 rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col h-full">
          <h2 className="text-lg font-[Poppins] font-bold text-gray-900 mb-5">Quick actions</h2>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <QuickAction icon={<Building2 size={24} />} label="Find Housing" onClick={() => setPage("housing")} />
            <QuickAction icon={<ShoppingCart size={24} />} label="Order Grocery" onClick={() => setPage("grocery")} />
            <QuickAction icon={<Car size={24} />} label="Book Transport" onClick={() => setPage("transport")} />
            <QuickAction icon={<CreditCard size={24} />} label="Checkout" onClick={() => setPage("checkout")} />
          </div>
        </div>

        {/* 5. Recent Activity */}
        <div className="bg-white p-6 rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col h-full">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-[Poppins] font-bold text-gray-900">Recent activity</h2>
            <button className="text-sm font-medium text-[#4DBE55] hover:underline">View all</button>
          </div>
          <div className="flex flex-col gap-2 flex-1 justify-between">
            <ActivityRow 
              icon={<Package size={18} />} 
              title="Grocery Order Delivered" 
              subtitle="Rahman Stores" 
              time="2h ago" 
              color="bg-[#edf7ee] text-[#4DBE55]" 
            />
            <ActivityRow 
              icon={<Car size={18} />} 
              title="Ride to Dhanmondi" 
              subtitle="Toyota Aqua • Driver: Karim" 
              time="Yesterday" 
              color="bg-blue-50 text-blue-500" 
            />
            <ActivityRow 
              icon={<Heart size={18} />} 
              title="Saved an Apartment" 
              subtitle="3BR Family Flat in Gulshan" 
              time="2 days ago" 
              color="bg-pink-50 text-pink-500" 
            />
            <ActivityRow 
              icon={<Wallet size={18} />} 
              title="Payment Processed" 
              subtitle="Virtual Ledger Split" 
              time="2 days ago" 
              color="bg-amber-50 text-amber-500" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Sub-components ────────────────────────────────────────────────
function StatCard({ icon, title, value, trend, trendPositive }: any) {
  return (
    <div className="bg-white p-5 rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300 cursor-default">
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 rounded-full bg-[#edf7ee] text-[#4DBE55] flex items-center justify-center">
          {icon}
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${trendPositive ? 'bg-[#edf7ee] text-[#4DBE55]' : 'bg-gray-100 text-[#71776D]'}`}>
          {trend}
        </span>
      </div>
      <div className="mt-1">
        <p className="text-xs text-[#71776D] font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-[Poppins] font-bold text-gray-900 tracking-tight">{value}</h3>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:bg-[#edf7ee] hover:border-green-200 hover:text-[#4DBE55] transition-all duration-200 group"
    >
      <div className="text-gray-400 group-hover:text-[#4DBE55] transition-colors duration-200 group-hover:scale-110">
        {icon}
      </div>
      <span className="text-sm font-semibold text-gray-700 group-hover:text-[#4DBE55] transition-colors">{label}</span>
    </button>
  );
}

function ActivityRow({ icon, title, subtitle, time, color }: any) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100 group">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${color} group-hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-900 truncate">{title}</h4>
        <p className="text-xs text-[#71776D] truncate mt-0.5">{subtitle}</p>
      </div>
      <div className="text-xs font-medium text-gray-400 whitespace-nowrap pl-2">
        {time}
      </div>
    </div>
  );
}

// ─── Main App Component ───────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("dashboard"); // Defaulted to dashboard for immediate preview
  const [role, setRole] = useState<Role>("resident");

  useEffect(() => {
    // Scroll to top on page change
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <div className="min-h-screen bg-[#f7faf7] font-[Inter] selection:bg-green-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap');
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Poppins', sans-serif !important;
        }
      `}</style>
      <Navbar page={page} setPage={setPage} />
      
      <main className="animate-in fade-in duration-300">
        {page === "landing" && <LandingPage setPage={setPage} />}
        {page === "auth" && <AuthPage setPage={setPage} setRole={setRole} />}
        {page === "admin" && <AdminDashboardPage />}
        {page === "checkout" && <CheckoutPage setPage={setPage} />}
        {page === "payment_status" && <PaymentStatusPage setPage={setPage} />}
        {page === "dashboard" && <DashboardPage setPage={setPage} />}
        
        {/* Placeholder Pages */}
        {page === "housing" && <StubPage title="Housing Search" icon={<Building2 size={64}/>} actionText="Go Home" onAction={() => setPage("landing")} />}
        {page === "grocery" && <StubPage title="Grocery Market" icon={<ShoppingCart size={64}/>} actionText="Go to Checkout" onAction={() => setPage("checkout")} />}
        {page === "transport" && <StubPage title="Transport Booking" icon={<Car size={64}/>} actionText="Go Home" onAction={() => setPage("landing")} />}
      </main>

      <AIAssistant />
    </div>
  );
}