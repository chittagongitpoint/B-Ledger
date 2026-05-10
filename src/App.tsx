/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Users, 
  LayoutDashboard, 
  Receipt, 
  ChevronRight, 
  ArrowLeft,
  X,
  Calendar as CalendarIcon,
  Trash2,
  Edit2,
  Phone,
  User as UserIcon,
  Settings,
  MapPin,
  Lock,
  PlusCircle,
  Cloud,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO, startOfDay, isSameDay, isWithinInterval, startOfWeek, endOfWeek, subDays } from 'date-fns';
import { 
  Transaction, 
  TransactionType, 
  Customer, 
  TRANSACTION_TYPES, 
  IN_TYPES, 
  OUT_TYPES,
  SystemSettings,
  TransactionCategory
} from './types';

// --- Utils ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('BDT', '৳');
};

const generateId = () => Math.random().toString(36).substring(2, 9);

// --- Local Storage Hooks ---
const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(storedValue));
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
};

// --- Components ---

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

const Toast = ({ message, type = 'success', onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-2xl shadow-xl border flex items-center gap-2 font-bold text-sm ${
        type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-rose-600 text-white border-rose-500'
      }`}
    >
      {type === 'success' ? <PlusCircle size={18} /> : <X size={18} />}
      {message}
    </motion.div>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: string;
}

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', confirmColor = 'bg-rose-600' }: ConfirmModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <div className="space-y-6">
      <div className="p-4 bg-neutral-50 rounded-2xl text-neutral-600 flex items-start gap-3">
        <div className={`p-2 rounded-lg ${confirmColor} text-white`}>
          <Trash2 size={20} />
        </div>
        <p className="text-sm font-medium leading-relaxed">{message}</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-4 bg-neutral-100 text-neutral-500 rounded-2xl font-bold text-sm">
          Cancel
        </button>
        <button 
          onClick={() => { onConfirm(); onClose(); }} 
          className={`flex-1 py-4 ${confirmColor} text-white rounded-2xl font-bold text-sm shadow-lg`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </Modal>
);

const LoginPage = ({ settings, onLogin }: { settings: SystemSettings; onLogin: () => void }) => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = settings.password || '123456';
    const inputMobile = mobile.trim();
    const inputPassword = password.trim();
    
    if (inputMobile === settings.mobile.trim() && inputPassword === correctPassword.trim()) {
      onLogin();
    } else {
      setError('Invalid mobile or password');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-neutral-200/50 p-8 border border-neutral-100"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 mb-4">
            <Receipt size={32} />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 leading-tight">BDShop Ledger</h1>
          <p className="text-neutral-400 text-sm font-medium">Please login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
           {error && (
             <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100">
               {error}
             </div>
           )}
           <div>
             <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">Mobile Number</label>
             <div className="relative">
               <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
               <input 
                 type="tel" 
                 value={mobile}
                 onChange={(e) => setMobile(e.target.value)}
                 placeholder="017xxxxxxxx" 
                 required
                 className="w-full bg-neutral-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
               />
             </div>
           </div>
           <div>
             <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
             <div className="relative">
               <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
               <input 
                 type="password" 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 placeholder="••••••" 
                 required
                 className="w-full bg-neutral-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
               />
             </div>
           </div>
           <button 
             type="submit" 
             className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all mt-4"
           >
             Login
           </button>
           
           <button 
             type="button"
             onClick={() => {
               if(confirm('This will DELETE all local data and reset login to 01837131056 / 123456. Continue?')) {
                 localStorage.clear();
                 window.location.reload();
               }
             }}
             className="w-full py-2 text-neutral-400 text-[10px] font-bold uppercase tracking-widest hover:text-rose-500 transition-colors"
           >
             Reset System to Defaults
           </button>
        </form>
      </motion.div>
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-bottom border-neutral-100 flex items-center justify-between">
            <h3 className="font-semibold text-lg">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[80vh]">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage<boolean>('isLoggedIn', false);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'customers' | 'settings'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingCategory, setEditingCategory] = useState<TransactionCategory | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  
  // Notification system
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmData, setConfirmData] = useState<{ 
    title: string; 
    message: string; 
    onConfirm: () => void;
    confirmLabel?: string;
    confirmColor?: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  const [settings, setSettings] = useLocalStorage<SystemSettings>('settings', {
    systemName: 'BDShop Ledger',
    userName: 'Admin',
    mobile: '01837131056',
    googleSheetUrl: import.meta.env.VITE_GOOGLE_SHEET_URL || ''
  });

  const [categories, setCategories] = useLocalStorage<TransactionCategory[]>('categories', 
    Object.entries(TRANSACTION_TYPES).map(([id, data]) => ({ id, ...data, isSystem: true }))
  );
  
  const [manualCustomers, setManualCustomers] = useLocalStorage<Customer[]>('manualCustomers', []);

  const getCategory = (type: string) => {
    return categories.find(c => c.id === type) || { label: type, color: 'text-neutral-500', direction: 'in' as const };
  };
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'custom'>('all');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');

  // Computed Customers
  const allCustomers = useMemo(() => {
    const customerMap: Record<string, Customer> = {};
    
    // Initialize with manual customers
    manualCustomers.forEach(c => {
      const normalizedName = c.name.trim();
      customerMap[normalizedName] = { ...c, name: normalizedName, currentBalance: 0 };
    });

    // Sort transactions chronologically
    const sortedTs = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedTs.forEach(t => {
      if (t.customerName) {
        const normalizedName = t.customerName.trim();
        if (!customerMap[normalizedName]) {
          customerMap[normalizedName] = {
            id: generateId(),
            name: normalizedName,
            currentBalance: 0,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt
          };
        }
        
        const cat = getCategory(t.type);
        // Balance increases on money "OUT" (Due/Credit) and decreases on money "IN" (Payment)
        if (cat.direction === 'out') {
          customerMap[normalizedName].currentBalance += t.amount;
        } else {
          customerMap[normalizedName].currentBalance -= t.amount;
        }
        
        customerMap[normalizedName].updatedAt = t.updatedAt;
      }
    });

    return Object.values(customerMap);
  }, [transactions, manualCustomers, categories]);

  // Totals
  const totals = useMemo(() => {
    const today = startOfDay(new Date());
    
    return transactions.reduce((acc, t) => {
      const tDate = startOfDay(parseISO(t.date));
      const amount = t.amount;
      const isIn = IN_TYPES.includes(t.type);
      
      // All time
      if (isIn) acc.allTimeIn += amount;
      else acc.allTimeOut += amount;
      
      // Daily
      if (isSameDay(tDate, today)) {
        if (isIn) acc.dailyIn += amount;
        else acc.dailyOut += amount;
      }
      
      return acc;
    }, { dailyIn: 0, dailyOut: 0, allTimeIn: 0, allTimeOut: 0 });
  }, [transactions]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (t.customerName?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || t.type === typeFilter;
        
        let matchesDate = true;
        const now = new Date();
        const tDate = parseISO(t.date);
        
        if (dateFilter === 'today') matchesDate = isSameDay(tDate, now);
        else if (dateFilter === 'week') matchesDate = isWithinInterval(tDate, { start: startOfWeek(now), end: endOfWeek(now) });
        
        return matchesSearch && matchesType && matchesDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchQuery, typeFilter, dateFilter]);

  const handleSaveTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const now = new Date().toISOString();
    
    const type = formData.get('type') as TransactionType;
    const customerName = (formData.get('customerName') as string)?.trim();

    if ((type === 'customer_payment' || type === 'customer_due') && !customerName) {
      alert('Customer name is required for credit/payment transactions.');
      return;
    }

    const data: Partial<Transaction> = {
      date: formData.get('date') as string,
      type,
      amount: parseFloat(formData.get('amount') as string),
      description: formData.get('description') as string,
      customerName: customerName || undefined,
    };

    if (editingTransaction) {
      setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? { ...t, ...data, updatedAt: now } : t));
      showToast('Transaction updated successfully');
    } else {
      setTransactions(prev => [{
        ...data as Transaction,
        id: generateId(),
        createdAt: now,
        updatedAt: now
      }, ...prev]);
      showToast('Transaction saved successfully');
    }
    
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const deleteTransaction = (id: string) => {
    setConfirmData({
      title: 'Delete Transaction',
      message: 'This will permanently remove this transaction from the ledger.',
      onConfirm: () => {
        setTransactions(prev => prev.filter(t => t.id !== id));
        showToast('Transaction deleted successfully');
      },
      confirmLabel: 'Delete Forever',
      confirmColor: 'bg-rose-600'
    });
  };

  const handleSaveCustomer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const now = new Date().toISOString();
    const name = (formData.get('name') as string).trim();
    
    if (editingCustomer) {
      setManualCustomers(prev => prev.map(c => 
        c.id === editingCustomer.id 
          ? { 
              ...c, 
              name, 
              phone: (formData.get('phone') as string).trim() || undefined, 
              address: (formData.get('address') as string).trim() || undefined,
              updatedAt: now 
            } 
          : c
      ));
      setEditingCustomer(null);
      showToast('Customer updated successfully');
    } else {
      const newCustomer: Customer = {
        id: generateId(),
        name,
        phone: (formData.get('phone') as string).trim() || undefined,
        address: (formData.get('address') as string).trim() || undefined,
        currentBalance: 0,
        createdAt: now,
        updatedAt: now
      };

      setManualCustomers(prev => [...prev, newCustomer]);
      showToast('Customer added successfully');
    }
    setIsCustomerFormOpen(false);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    const hasTransactions = transactions.some(t => t.customerName?.trim() === customer.name.trim());
    setConfirmData({
      title: 'Delete Customer',
      message: hasTransactions 
        ? `This customer has transaction history. Removing them from the list won't erase transactions, but their profile will be gone. Continue?`
        : 'Are you sure you want to delete this customer?',
      onConfirm: () => {
        setManualCustomers(prev => prev.filter(c => c.id !== customer.id));
        showToast('Customer deleted');
      },
      confirmLabel: 'Delete Customer',
      confirmColor: 'bg-rose-600'
    });
  };

  const [isSyncing, setIsSyncing] = useState(false);

  const syncToCloud = async (overrideUrl?: string) => {
    const url = overrideUrl || settings.googleSheetUrl;
    if (!url) return;

    setIsSyncing(true);
    try {
      // Sync Transactions
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_transactions', payload: transactions })
      });

      // Sync Customers
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_customers', payload: manualCustomers })
      });

      // Sync Settings
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_settings', payload: settings })
      });
      
      showToast('Cloud sync complete');
    } catch (error) {
      console.error('Sync failed:', error);
      showToast('Sync failed. Check URL.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchFromCloud = async () => {
    if (!settings.googleSheetUrl) return;

    setIsSyncing(true);
    try {
      const response = await fetch(settings.googleSheetUrl);
      const data = await response.json();
      
      if (data.transactions) setTransactions(data.transactions);
      if (data.customers) setManualCustomers(data.customers);
      if (data.settings) {
        // Preserve the current Google Sheet URL even when importing
        setSettings({ ...data.settings, googleSheetUrl: settings.googleSheetUrl });
      }
      
      showToast('Data imported from cloud');
    } catch (error) {
      console.error('Fetch failed:', error);
      showToast('Cloud import failed', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-sync effect
  useEffect(() => {
    if (!settings.googleSheetUrl || !isLoggedIn) return;
    
    const timer = setTimeout(() => {
      syncToCloud();
    }, 2000); // 2 second debounce to prevent rapid-fire syncing

    return () => clearTimeout(timer);
  }, [transactions, manualCustomers, settings.systemName, settings.userName, settings.mobile]);

  const handleUpdateSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    setSettings({
      systemName: formData.get('systemName') as string,
      userName: formData.get('userName') as string,
      mobile: formData.get('mobile') as string,
      googleSheetUrl: formData.get('googleSheetUrl') as string,
      password: formData.get('password') as string || settings.password,
    });
    showToast('Settings updated successfully');
  };

  const handleAddCategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (editingCategory) {
      setCategories(prev => prev.map(c => 
        c.id === editingCategory.id 
          ? { ...c, label: formData.get('label') as string, direction: formData.get('direction') as 'in' | 'out', color: formData.get('direction') === 'in' ? 'text-emerald-600' : 'text-rose-600' }
          : c
      ));
      setEditingCategory(null);
      showToast('Transaction type updated');
    } else {
      const newCat: TransactionCategory = {
        id: (formData.get('label') as string).toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
        label: formData.get('label') as string,
        direction: formData.get('direction') as 'in' | 'out',
        color: formData.get('direction') === 'in' ? 'text-emerald-600' : 'text-rose-600',
      };
      setCategories(prev => [...prev, newCat]);
      showToast('New transaction type added');
    }
    setIsCatModalOpen(false);
    setEditingCategory(null);
    e.currentTarget.reset();
  };

  const handleDeleteCategory = (id: string) => {
    setConfirmData({
      title: 'Delete Category',
      message: 'Transactions using this type will show a neutral label. This cannot be undone.',
      onConfirm: () => {
        setCategories(prev => prev.filter(c => c.id !== id));
        showToast('Transaction type deleted');
      },
      confirmLabel: 'Delete Category',
      confirmColor: 'bg-rose-600'
    });
  };

  // --- Views ---
  if (!isLoggedIn) {
     return <LoginPage settings={settings} onLogin={() => setIsLoggedIn(true)} />;
  }

  if (selectedCustomer) {
    const customer = allCustomers.find(c => c.name === selectedCustomer);
    const customerHistory = transactions
      .filter(t => t.customerName === selectedCustomer)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = 0;
    const historyWithBalance = customerHistory.map(t => {
      const cat = getCategory(t.type);
      // Balance increases on money "OUT" (Due/Credit) and decreases on money "IN" (Payment)
      if (cat.direction === 'out') runningBalance += t.amount;
      else runningBalance -= t.amount;
      return { ...t, runningBalance, cat };
    }).reverse();

    return (
      <div className="min-h-screen pb-24 px-4 pt-6 max-w-2xl mx-auto">
        <button 
          onClick={() => setSelectedCustomer(null)}
          className="flex items-center gap-2 text-neutral-500 mb-6 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Customers</span>
        </button>
        
        <div className="card p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <UserIcon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{selectedCustomer}</h2>
              <div className="flex flex-col gap-1">
                {customer?.phone && <p className="text-neutral-500 text-sm flex items-center gap-1"><Phone size={14} /> {customer.phone}</p>}
                {customer?.address && <p className="text-neutral-500 text-sm flex items-center gap-1"><MapPin size={14} /> {customer.address}</p>}
              </div>
            </div>
          </div>
          <div className="p-4 bg-neutral-50 rounded-xl">
            <p className="text-sm text-neutral-500 mb-1">Current Balance</p>
            <p className={`text-2xl font-bold ${customer?.currentBalance && customer.currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {formatCurrency(customer?.currentBalance || 0)}
              <span className="text-xs ml-2 font-normal text-neutral-400">
                {customer?.currentBalance && customer.currentBalance > 0 ? 'Owed to business' : 'No dues'}
              </span>
            </p>
          </div>
        </div>

        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-neutral-500">Transaction History</h3>
        <div className="space-y-3">
          {historyWithBalance.map((t) => (
            <div key={t.id} className="card p-4 flex justify-between items-center group">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.cat.color.replace('text-', 'bg-').replace('600', '100')} ${t.cat.color}`}>
                    {t.cat.label}
                  </span>
                  <span className="text-xs text-neutral-400">{format(parseISO(t.date), 'dd MMM yyyy')}</span>
                </div>
                <p className="font-medium text-sm">{t.description}</p>
                <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-tighter">Balance after this: {formatCurrency(t.runningBalance)}</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className={`font-bold ${IN_TYPES.includes(t.type) ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {IN_TYPES.includes(t.type) ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 mt-2">
                   <button onClick={() => { setEditingTransaction(t); setIsFormOpen(true); }} className="p-1 hover:bg-neutral-100 rounded text-neutral-400"><Edit2 size={14} /></button>
                   <button onClick={() => deleteTransaction(t.id)} className="p-1 hover:bg-red-50 rounded text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Receipt size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight uppercase tracking-tight">{settings.systemName}</h1>
            <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest leading-none">Powered by {settings.userName}</p>
          </div>
        </div>
        <AnimatePresence>
          {dateFilter !== 'all' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full font-bold flex items-center gap-2"
            >
              <CalendarIcon size={14} />
              {dateFilter === 'today' ? 'Showing Today' : 'Showing This Week'}
              <button onClick={() => setDateFilter('all')} className="hover:text-indigo-800"><X size={14} /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6">
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Daily Summary */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-neutral-500 text-xs uppercase tracking-widest flex items-center gap-2">
                  <CalendarIcon size={14} /> Daily position
                </h2>
                <span className="text-xs font-semibold text-neutral-400">{format(new Date(), 'dd MMMM yyyy')}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-5 bg-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ArrowDownLeft size={18} /></div>
                    <span className="text-sm font-medium text-neutral-500">In</span>
                  </div>
                  <p className="text-2xl font-bold tabular-nums">{formatCurrency(totals.dailyIn)}</p>
                </div>
                <div className="card p-5 bg-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><ArrowUpRight size={18} /></div>
                    <span className="text-sm font-medium text-neutral-500">Out</span>
                  </div>
                  <p className="text-2xl font-bold tabular-nums">{formatCurrency(totals.dailyOut)}</p>
                </div>
                <div className={`card p-5 ${totals.dailyIn - totals.dailyOut >= 0 ? 'bg-indigo-600' : 'bg-rose-600 shadow-lg shadow-rose-200'}`}>
                  <p className="text-sm opacity-80 mb-2 font-medium">Daily Net</p>
                  <p className="text-2xl font-bold tabular-nums">{formatCurrency(totals.dailyIn - totals.dailyOut)}</p>
                </div>
              </div>
            </section>

            {/* All Time Summary */}
            <section>
              <h2 className="font-bold text-neutral-500 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                 <LayoutDashboard size={14} /> Overall Statistics
              </h2>
              <div className="card p-1 bg-neutral-100 flex gap-1">
                <div className="flex-1 bg-white rounded-xl p-4">
                  <p className="text-xs text-neutral-400 font-bold uppercase mb-1">Total In</p>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(totals.allTimeIn)}</p>
                </div>
                <div className="flex-1 bg-white rounded-xl p-4">
                  <p className="text-xs text-neutral-400 font-bold uppercase mb-1">Total Out</p>
                  <p className="text-lg font-bold text-rose-600">{formatCurrency(totals.allTimeOut)}</p>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section>
              <div className="flex items-center justify-between mb-4">
                 <h2 className="font-bold text-neutral-500 text-xs uppercase tracking-widest">Recent Activity</h2>
                 <button onClick={() => setActiveTab('transactions')} className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline">
                   View All <ChevronRight size={14} />
                 </button>
              </div>
              <div className="space-y-3">
                {transactions.slice(0, 5).map((t) => (
                  <div key={t.id} className="card p-4 flex justify-between items-center bg-white hover:bg-neutral-50 transition-colors cursor-pointer" onClick={() => { setEditingTransaction(t); setIsFormOpen(true); }}>
                    <div className="flex items-center gap-4">
                       <div className={`p-3 rounded-2xl ${IN_TYPES.includes(t.type) ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {IN_TYPES.includes(t.type) ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                       </div>
                       <div>
                          <p className="font-bold text-sm">{t.description}</p>
                          <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-2">
                            {format(parseISO(t.date), 'dd MMM')} • <span className="font-medium text-neutral-500"> {getCategory(t.type).label}</span>
                          </p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className={`font-bold ${IN_TYPES.includes(t.type) ? 'text-emerald-600' : 'text-rose-600'}`}>
                         {IN_TYPES.includes(t.type) ? '+' : '-'}{formatCurrency(t.amount)}
                       </p>
                       {t.customerName && <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">{t.customerName}</p>}
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div className="text-center py-12 text-neutral-400 card bg-white">
                    <Receipt size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No transactions yet.</p>
                  </div>
                )}
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'transactions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
             {/* Search and Filter */}
             <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search by description or customer..." 
                    className="w-full bg-white card outline-none pl-12 pr-4 py-3 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                   {(['all', 'today', 'week'] as const).map(f => (
                     <button 
                       key={f}
                       onClick={() => setDateFilter(f)}
                       className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${dateFilter === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-neutral-500 border-neutral-200'}`}
                     >
                       {f.charAt(0).toUpperCase() + f.slice(1)}
                     </button>
                   ))}
                   <div className="w-[1px] bg-neutral-200 mx-1" />
                   <select 
                    className="bg-white card border-neutral-200 px-4 py-2 text-xs font-bold outline-none cursor-pointer"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                   >
                     <option value="all">All Types</option>
                     {categories.map(cat => (
                       <option key={cat.id} value={cat.id}>{cat.label}</option>
                     ))}
                   </select>
                </div>
             </div>

             <div className="space-y-3">
                {filteredTransactions.map((t) => (
                  <div key={t.id} className="card p-4 flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                       <div className={`p-2 rounded-xl flex items-center justify-center ${IN_TYPES.includes(t.type) ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {IN_TYPES.includes(t.type) ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                       </div>
                       <div>
                          <div className="flex items-center gap-2 mb-1">
                             <p className="font-bold text-sm">{t.description}</p>
                             <span className="text-[10px] text-neutral-400 font-medium">{format(parseISO(t.date), 'dd/MM/yyyy')}</span>
                          </div>
                          <p className={`text-[10px] font-bold uppercase tracking-wider ${getCategory(t.type).color}`}>
                            {getCategory(t.type).label} {t.customerName ? `• ${t.customerName}` : ''}
                          </p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                         <p className={`font-bold text-sm ${IN_TYPES.includes(t.type) ? 'text-emerald-600' : 'text-rose-600'}`}>
                           {IN_TYPES.includes(t.type) ? '+' : '-'}{formatCurrency(t.amount)}
                         </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-1">
                        <button onClick={() => { setEditingTransaction(t); setIsFormOpen(true); }} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => deleteTransaction(t.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-20 text-neutral-400">
                    <Filter size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="font-medium">No results found for current filters.</p>
                  </div>
                )}
             </div>
          </motion.div>
        )}

        {activeTab === 'customers' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
             <div className="flex gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search customers..." 
                    className="w-full bg-white card outline-none pl-12 pr-4 py-3 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               <button 
                 onClick={() => setIsCustomerFormOpen(true)}
                 className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-2 font-bold text-xs"
               >
                 <PlusCircle size={18} />
                 <span className="hidden sm:inline">Add Customer</span>
               </button>
             </div>
             
             <div className="grid grid-cols-1 gap-3">
                {allCustomers
                  .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .sort((a, b) => b.currentBalance - a.currentBalance)
                  .map(c => (
                  <div key={c.id} className="card p-5 group flex justify-between items-center hover:border-indigo-200 transition-all">
                    <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => setSelectedCustomer(c.name)}>
                      <div className="w-12 h-12 bg-neutral-100 group-hover:bg-indigo-50 text-neutral-400 group-hover:text-indigo-600 rounded-full flex items-center justify-center transition-colors">
                        <UserIcon size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg leading-none mb-1">{c.name}</h3>
                        <p className="text-xs text-neutral-400 font-medium uppercase tracking-tight flex items-center gap-1">
                          Last Updated: {format(parseISO(c.updatedAt), 'dd MMM')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right cursor-pointer" onClick={() => setSelectedCustomer(c.name)}>
                        <p className={`text-xl font-black ${c.currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {formatCurrency(c.currentBalance)}
                        </p>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{c.currentBalance > 0 ? 'Due' : 'Clear'}</p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingCustomer(c); setIsCustomerFormOpen(true); }}
                          className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(c); }}
                          className="p-2 hover:bg-rose-50 rounded-lg text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {allCustomers.length === 0 && (
                  <div className="text-center py-20 text-neutral-400 bg-white card">
                    <Users size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="font-medium">No customer records yet.</p>
                  </div>
                )}
             </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
            <section className="card p-6">
              <h2 className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <Settings size={18} /> System Settings
              </h2>
              <form onSubmit={handleUpdateSettings} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Business Name</label>
                    <input name="systemName" type="text" defaultValue={settings.systemName} required className="w-full card border-neutral-200 px-4 py-3 text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Owner Name</label>
                    <input name="userName" type="text" defaultValue={settings.userName} required className="w-full card border-neutral-200 px-4 py-3 text-sm font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Mobile Number</label>
                  <input name="mobile" type="tel" defaultValue={settings.mobile} required className="w-full card border-neutral-200 px-4 py-3 text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                    <Lock size={14} /> Update Password (Optional)
                  </label>
                  <input name="password" type="password" placeholder="Leave blank to keep current" className="w-full card border-neutral-200 px-4 py-3 text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                    <Cloud size={14} /> Google Sheet API URL
                  </label>
                  <input 
                    name="googleSheetUrl" 
                    type="url" 
                    defaultValue={settings.googleSheetUrl} 
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full card border-neutral-200 px-4 py-3 text-sm font-medium" 
                  />
                  <p className="text-[10px] text-neutral-400 mt-1 font-medium italic">Paste your Apps Script Web App URL here for cloud backup.</p>
                </div>

                <div className="flex gap-3 mt-4">
                   <button type="submit" className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100">
                     Update Settings
                   </button>
                   {settings.googleSheetUrl && (
                     <button 
                       type="button" 
                       onClick={() => syncToCloud()}
                       disabled={isSyncing}
                       className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                     >
                       {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <Cloud size={14} />}
                       Sync
                     </button>
                   )}
                </div>
                
                {settings.googleSheetUrl && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setConfirmData({
                        title: 'Import Cloud Data',
                        message: 'This will replace ALL local data with data from your Google Sheet. This action cannot be undone. Continue?',
                        confirmLabel: 'Import Now',
                        confirmColor: 'bg-indigo-600',
                        onConfirm: () => fetchFromCloud()
                      });
                    }}
                    disabled={isSyncing}
                    className="w-full py-3 bg-neutral-100 text-neutral-500 rounded-xl font-bold text-xs mt-2"
                  >
                    Import from Google Sheet
                  </button>
                )}
                
                <button 
                  type="button" 
                  onClick={() => {
                    setConfirmData({
                      title: 'Logout Account',
                      message: 'Are you sure you want to logout from your account?',
                      confirmLabel: 'Logout',
                      confirmColor: 'bg-rose-600',
                      onConfirm: () => setIsLoggedIn(false)
                    });
                  }}
                  className="w-full py-3 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm mt-4"
                >
                  Logout Account
                </button>
              </form>
            </section>

            <section className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                  <Receipt size={18} /> Transaction Types
                </h2>
                <button 
                  onClick={() => { setEditingCategory(null); setIsCatModalOpen(true); }}
                  className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl group/cat">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${cat.direction === 'in' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className="text-sm font-medium">{cat.label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">{cat.direction === 'in' ? 'In' : 'Out'}</span>
                      <div className="flex gap-1 opacity-0 group-hover/cat:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingCategory(cat); setIsCatModalOpen(true); }} className="p-1.5 hover:bg-white rounded-lg text-neutral-400 transition-colors">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        )}
      </main>

      {/* Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex items-center justify-around px-4 py-3 z-40 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-neutral-400'}`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-50' : 'bg-transparent'}`}>
            <LayoutDashboard size={20} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tight">Dashboard</span>
        </button>
        <button 
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'transactions' ? 'text-indigo-600' : 'text-neutral-400'}`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeTab === 'transactions' ? 'bg-indigo-50' : 'bg-transparent'}`}>
            <Receipt size={20} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tight">Ledger</span>
        </button>
        <div className="relative -top-5">
          <button 
            onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }}
            className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>
        <button 
          onClick={() => setActiveTab('customers')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'customers' ? 'text-indigo-600' : 'text-neutral-400'}`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeTab === 'customers' ? 'bg-indigo-50' : 'bg-transparent'}`}>
            <Users size={20} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tight">Customers</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'settings' ? 'text-indigo-600' : 'text-neutral-400'}`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-indigo-50' : 'bg-transparent'}`}>
            <Settings size={20} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tight">Settings</span>
        </button>
      </nav>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>

      {confirmData && (
        <ConfirmModal 
          isOpen={true}
          onClose={() => setConfirmData(null)}
          onConfirm={confirmData.onConfirm}
          title={confirmData.title}
          message={confirmData.message}
          confirmLabel={confirmData.confirmLabel}
          confirmColor={confirmData.confirmColor}
        />
      )}

      {/* Customer Form Modal */}
      <Modal 
        isOpen={isCustomerFormOpen} 
        onClose={() => { setIsCustomerFormOpen(false); setEditingCustomer(null); }} 
        title={editingCustomer ? "Edit Customer" : "Add New Customer"}
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Full Name</label>
            <input 
              name="name" 
              type="text" 
              required 
              placeholder="Customer's full name" 
              defaultValue={editingCustomer?.name}
              className="w-full card border-neutral-200 px-4 py-3 text-sm font-medium" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Phone Number</label>
            <input 
              name="phone" 
              type="tel" 
              placeholder="+880" 
              defaultValue={editingCustomer?.phone}
              className="w-full card border-neutral-200 px-4 py-3 text-sm font-medium" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><MapPin size={12}/> Address</label>
            <textarea 
              name="address" 
              placeholder="Store or residential address" 
              defaultValue={editingCustomer?.address}
              className="w-full card border-neutral-200 px-4 py-3 text-sm font-medium h-24 resize-none" 
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button 
              type="button" 
              onClick={() => { setIsCustomerFormOpen(false); setEditingCustomer(null); }} 
              className="flex-1 py-3 text-sm font-bold text-neutral-400 hover:bg-neutral-100 rounded-xl"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`flex-[2] py-3 text-sm font-bold rounded-xl shadow-lg ${editingCustomer ? 'bg-amber-600 shadow-amber-100' : 'bg-indigo-600 shadow-indigo-100'} text-white`}
            >
              {editingCustomer ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Transaction Type Modal */}
      <Modal 
        isOpen={isCatModalOpen} 
        onClose={() => { setIsCatModalOpen(false); setEditingCategory(null); }} 
        title={editingCategory ? "Edit Transaction Type" : "Add Transaction Type"}
      >
        <form onSubmit={handleAddCategory} className="space-y-5">
           <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Type Name</label>
              <input 
                name="label" 
                type="text" 
                placeholder="e.g., Office Supplies" 
                key={editingCategory?.id}
                defaultValue={editingCategory?.label}
                required 
                className="w-full card border-neutral-200 px-4 py-3 text-sm font-medium" 
              />
           </div>
           <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Direction</label>
              <select 
                name="direction" 
                defaultValue={editingCategory?.direction || 'in'}
                key={editingCategory?.id + '_dir'}
                className="w-full card border-neutral-200 px-4 py-3 text-sm font-medium"
              >
                <option value="in">In (+)</option>
                <option value="out">Out (-)</option>
              </select>
           </div>
           <div className="flex gap-3 pt-4">
              <button 
                type="button" 
                onClick={() => { setIsCatModalOpen(false); setEditingCategory(null); }} 
                className="flex-1 py-4 bg-neutral-100 text-neutral-500 rounded-2xl font-bold text-sm"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={`flex-[2] py-4 rounded-2xl transition-all font-bold text-sm text-white shadow-lg ${
                  editingCategory ? 'bg-amber-600 shadow-amber-100' : 'bg-indigo-600 shadow-indigo-100'
                }`}
              >
                {editingCategory ? 'Update Type' : 'Add Type'}
              </button>
           </div>
        </form>
      </Modal>

      {/* Transaction Form Modal */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => { setIsFormOpen(false); setEditingTransaction(null); }}
        title={editingTransaction ? 'Edit Transaction' : 'New Transaction'}
      >
        <form onSubmit={handleSaveTransaction} className="space-y-5">
           <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Date</label>
              <input 
                name="date" 
                type="date" 
                required 
                defaultValue={editingTransaction?.date || new Date().toISOString().split('T')[0]}
                className="w-full card border-neutral-200 px-4 py-3 text-sm font-medium"
              />
           </div>

           <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Type</label>
              <select 
                name="type" 
                required 
                defaultValue={editingTransaction?.type || 'cash_in'}
                className="w-full card border-neutral-200 px-4 py-3 text-sm font-medium"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
           </div>

           <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Amount (৳)</label>
              <input 
                name="amount" 
                type="number" 
                placeholder="0"
                required 
                min="0"
                step="0.01"
                defaultValue={editingTransaction?.amount}
                className="w-full card border-neutral-200 px-4 py-3 text-sm font-bold text-indigo-600"
              />
           </div>

           <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Description</label>
              <input 
                name="description" 
                type="text" 
                required 
                placeholder="e.g., Sold 5kg rice"
                defaultValue={editingTransaction?.description}
                className="w-full card border-neutral-200 px-4 py-3 text-sm font-medium"
              />
           </div>

           <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Customer (Optional)</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                <input 
                  name="customerName" 
                  type="text" 
                  list="customers-list"
                  placeholder="Enter name"
                  defaultValue={editingTransaction?.customerName}
                  className="w-full card border-neutral-200 pl-11 pr-4 py-3 text-sm font-medium"
                />
                <datalist id="customers-list">
                  {allCustomers.map(c => <option key={c.id} value={c.name} />)}
                </datalist>
              </div>
              <p className="text-[10px] text-neutral-400 mt-2 italic font-medium leading-tight">
                * Required for "Customer Payment" and "Customer Due".
              </p>
           </div>

           <div className="flex gap-3 pt-4">
              <button 
                type="button" 
                onClick={() => { setIsFormOpen(false); setEditingTransaction(null); }}
                className="flex-1 py-4 text-sm font-bold text-neutral-500 hover:bg-neutral-100 rounded-2xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-3 py-4 text-sm font-bold bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
              >
                {editingTransaction ? 'Update' : 'Save Transaction'}
              </button>
           </div>
        </form>
      </Modal>
    </div>
  );
}
