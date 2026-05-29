import React, { useState, useMemo } from 'react';
import { Player, Expense, PaymentLog } from '../types';
import { 
  IndianRupee, 
  Plus, 
  Search, 
  Trash2, 
  TrendingDown, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  PiggyBank,
  ArrowRightCircle,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FinanceTabProps {
  players: Player[];
  expenses: Expense[];
  paymentLogs: PaymentLog[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onAddContribution: (playerId: string, amount: number, date: string, notes?: string) => void;
  onDeleteExpense: (id: string) => void;
  isAdmin?: boolean;
}

export default function FinanceTab({
  players,
  expenses,
  paymentLogs,
  onAddExpense,
  onAddContribution,
  onDeleteExpense,
  isAdmin = false
}: FinanceTabProps) {
  // Filters & State
  const [playerSearch, setPlayerSearch] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Modals / Forms Active state
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  // New Expense form state
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseCost, setNewExpenseCost] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('Equipment');
  const [newExpensePurchaser, setNewExpensePurchaser] = useState('');
  const [newExpenseDate, setNewExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [newExpenseNotes, setNewExpenseNotes] = useState('');

  // New Contribution form state
  const [contribPlayerId, setContribPlayerId] = useState('');
  const [contribAmount, setContribAmount] = useState('');
  const [contribDate, setContribDate] = useState(new Date().toISOString().split('T')[0]);
  const [contribNotes, setContribNotes] = useState('');

  // Calculations
  const metrics = useMemo(() => {
    const totalCollected = players.reduce((sum, p) => sum + p.totalCollected, 0);
    const totalSpent = expenses.reduce((sum, e) => sum + e.cost, 0);
    const balance = totalCollected - totalSpent;
    const averageCollected = players.length > 0 ? (totalCollected / players.length) : 0;
    
    // Target per player to fund is around ₹150 (since ₹150 is preloaded max contribution)
    const targetContribution = 150;
    const activeContributors = players.filter(p => p.totalCollected > 0).length;

    return {
      totalCollected,
      totalSpent,
      balance,
      averageCollected,
      targetContribution,
      activeContributors
    };
  }, [players, expenses]);

  // Handle Expense Submit
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseName || !newExpenseCost) return;
    
    onAddExpense({
      productName: newExpenseName,
      cost: parseFloat(newExpenseCost),
      category: newExpenseCategory,
      purchasedBy: newExpensePurchaser || 'Team Manager',
      date: newExpenseDate,
      notes: newExpenseNotes
    });

    // Reset Form
    setNewExpenseName('');
    setNewExpenseCost('');
    setNewExpenseCategory('Equipment');
    setNewExpensePurchaser('');
    setNewExpenseDate(new Date().toISOString().split('T')[0]);
    setNewExpenseNotes('');
    setShowExpenseForm(false);
  };

  // Handle Payment Submit
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contribPlayerId || !contribAmount) return;

    onAddContribution(
      contribPlayerId,
      parseFloat(contribAmount),
      contribDate,
      contribNotes
    );

    // Reset Form
    setContribPlayerId('');
    setContribAmount('');
    setContribDate(new Date().toISOString().split('T')[0]);
    setContribNotes('');
    setShowPaymentForm(false);
  };

  // Filter players based on search
  const filteredPlayers = useMemo(() => {
    return players.filter(p => p.name.toLowerCase().includes(playerSearch.toLowerCase()));
  }, [players, playerSearch]);

  // Filter expenses based on search and category
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchSearch = e.productName.toLowerCase().includes(expenseSearch.toLowerCase()) || 
                          e.purchasedBy.toLowerCase().includes(expenseSearch.toLowerCase());
      const matchCategory = selectedCategory === 'All' || e.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [expenses, expenseSearch, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Ledger Balance */}
        <div id="card-balance" className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Available Balance</span>
            <span className={`p-2 rounded-xl text-xs font-semibold ${metrics.balance >= 100 ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'}`}>
              <PiggyBank className="w-4 h-4 inline mr-1" /> Team Pot
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold font-display tracking-tight text-white">
              ₹{metrics.balance.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Total revenue minus team costs</p>
          </div>
          <div className="mt-4 border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Funding Target Rate</span>
            <span className="font-semibold text-slate-300">
              {metrics.totalSpent > 0 ? `${Math.round((metrics.totalCollected / metrics.totalSpent) * 100)}%` : '100%'}
            </span>
          </div>
        </div>

        {/* Total Collections */}
        <div id="card-collections" className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Total Money Collected</span>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold font-display tracking-tight text-emerald-400">
              ₹{metrics.totalCollected.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Sum of player subscription fees</p>
          </div>
          <div className="mt-4 border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Contributors</span>
            <span className="font-semibold text-slate-300">{metrics.activeContributors} of {players.length} players</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div id="card-expenses" className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Total Purchases</span>
            <span className="p-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold font-display tracking-tight text-rose-400">
              ₹{metrics.totalSpent.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Equipment, fields, refreshments</p>
          </div>
          <div className="mt-4 border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Items Purchased</span>
            <span className="font-semibold text-slate-300">{expenses.length} records</span>
          </div>
        </div>

        {/* Averages / Stats */}
        <div id="card-averages" className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Avg Player Sub</span>
            <span className="p-1.5 bg-slate-950 border border-slate-850 text-slate-400 rounded-lg">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold font-display tracking-tight text-slate-200">
              ₹{Math.round(metrics.averageCollected)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Proposed season fee: ₹{metrics.targetContribution}</p>
          </div>
          <div className="mt-4 border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Team Completion</span>
            <span className="font-semibold text-indigo-400">
              {Math.round((metrics.averageCollected / metrics.targetContribution) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Buttons to Trigger Forms */}
      <div className="flex flex-wrap gap-3">
        {isAdmin ? (
          <>
            <button
              id="btn-trigger-payment-form"
              type="button"
              onClick={() => { setShowPaymentForm(true); setShowExpenseForm(false); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer transition shadow-md hover:shadow-indigo-500/20 border border-indigo-500/30"
            >
              <IndianRupee className="w-4 h-4" />
              Record Player Contribution
            </button>

            <button
              id="btn-trigger-expense-form"
              type="button"
              onClick={() => { setShowExpenseForm(true); setShowPaymentForm(false); }}
              className="bg-slate-850 hover:bg-slate-800 text-slate-200 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer transition shadow-md border border-slate-700"
            >
              <ShoppingBag className="w-4 h-4" />
              Log Team Purchase/Expense
            </button>
          </>
        ) : (
          <div className="p-4 bg-indigo-950/20 border border-indigo-850/40 rounded-2xl text-[11px] text-indigo-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-400/10 text-indigo-300 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider text-[9px] border border-indigo-400/20 shrink-0">🔒 Read Only Ledger</span>
              <span>Financial write-access is locked. To record contributions or log purchases, sign in as Admin <strong>Mano</strong>.</span>
            </div>
          </div>
        )}
      </div>

      {/* Forms Area (Shown Conditionally in dynamic cards) */}
      <AnimatePresence>
        {/* Contribution Payment Form */}
        {showPaymentForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900 p-6 rounded-2xl border border-indigo-500/30 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h4 className="font-display font-bold text-white flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-indigo-400" /> Record Fee Collection
              </h4>
              <button 
                type="button"
                className="text-slate-400 hover:text-white text-sm font-semibold transition"
                onClick={() => setShowPaymentForm(false)}
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Select Player</label>
                <select
                  required
                  value={contribPlayerId}
                  onChange={(e) => setContribPlayerId(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="" className="bg-slate-950">-- Choose contributing player --</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-950">
                      {p.name} (Jersey: #{p.jerseyNumber || 'N/A'}) - Paid: ₹{p.totalCollected}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Amount Collected (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="e.g. 50"
                    value={contribAmount}
                    onChange={(e) => setContribAmount(e.target.value)}
                    className="w-full text-sm bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 pl-8 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Collection Date</label>
                <input
                  required
                  type="date"
                  value={contribDate}
                  onChange={(e) => setContribDate(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Paid in cash"
                  value={contribNotes}
                  onChange={(e) => setContribNotes(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-4 flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-4 py-2 border border-slate-800 rounded-lg text-slate-400 text-xs font-semibold cursor-pointer hover:bg-slate-800 hover:text-white transition"
                >
                  Close
                </button>
                <button
                  id="btn-save-contribution"
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg cursor-pointer transition shadow-lg"
                >
                  Add Fund Entry
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Expense Log Form */}
        {showExpenseForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h4 className="font-display font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-400" /> Log Club Expense
              </h4>
              <button 
                type="button"
                className="text-slate-400 hover:text-white text-sm font-semibold transition"
                onClick={() => setShowExpenseForm(false)}
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleExpenseSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Item / Product Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Cricket kit bags, Ball box"
                  value={newExpenseName}
                  onChange={(e) => setNewExpenseName(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Expense Cost (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="Total Cost in INR"
                    value={newExpenseCost}
                    onChange={(e) => setNewExpenseCost(e.target.value)}
                    className="w-full text-sm bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 pl-8 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                <select
                  value={newExpenseCategory}
                  onChange={(e) => setNewExpenseCategory(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Equipment" className="bg-slate-950">Equipment / Gear</option>
                  <option value="Ground booking" className="bg-slate-950">Ground / Pitch Booking</option>
                  <option value="Refreshments" className="bg-slate-950">Refreshments / Drinks</option>
                  <option value="Umpire Fees" className="bg-slate-950">Umpiring & Officials</option>
                  <option value="Tournament Fee" className="bg-slate-950">Tournament registration</option>
                  <option value="Other" className="bg-slate-950">Other Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Purchaser / Logged By</label>
                <input
                  type="text"
                  placeholder="e.g. Rohit Sharma or Board"
                  value={newExpensePurchaser}
                  onChange={(e) => setNewExpensePurchaser(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Date purchased</label>
                <input
                  required
                  type="date"
                  value={newExpenseDate}
                  onChange={(e) => setNewExpenseDate(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Receipt saved with captain"
                  value={newExpenseNotes}
                  onChange={(e) => setNewExpenseNotes(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-3 flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseForm(false)}
                  className="px-4 py-2 border border-slate-800 rounded-lg text-slate-400 text-xs font-semibold cursor-pointer hover:bg-slate-800 hover:text-white transition"
                >
                  Close
                </button>
                <button
                  id="btn-save-expense"
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg cursor-pointer transition shadow-md"
                >
                  Save Outgoing Entry
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main split sections: Collections Ledger & Purchases logged */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left pane: Payments & Collections ledger */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-display font-bold text-white uppercase tracking-tight">Squad Contributions</h3>
              <p className="text-xs text-slate-400 mt-0.5">Fees ledger for 30 team players</p>
            </div>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search player..."
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                className="pl-9 pr-4 py-2 w-full md:w-56 text-xs bg-slate-950 border border-slate-800 text-slate-200 rounded-lg outline-none focus:border-indigo-400 transition"
              />
            </div>
          </div>

          {/* Ledger List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="pb-3 text-center w-12">#</th>
                  <th className="pb-3 pl-2">Player Details</th>
                  <th className="pb-3 hidden sm:table-cell">Role</th>
                  <th className="pb-3 text-right">Contributed</th>
                  <th className="pb-3 pr-2 text-right">Funding State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                      No matching players found.
                    </td>
                  </tr>
                ) : (
                  filteredPlayers.map((player, idx) => {
                    const statusPercent = Math.min(100, (player.totalCollected / metrics.targetContribution) * 100);
                    const isFullyPaid = player.totalCollected >= metrics.targetContribution;
                    const isPartiallyPaid = player.totalCollected > 0 && player.totalCollected < metrics.targetContribution;
                    
                    return (
                      <tr key={player.id} className="hover:bg-slate-950/40 transition duration-150">
                        <td className="py-3.5 text-center font-mono text-xs text-slate-500">
                          {player.jerseyNumber ? `#${player.jerseyNumber}` : idx + 1}
                        </td>
                        <td className="py-3.5 pl-2">
                          <div className="font-semibold text-slate-200">{player.name}</div>
                        </td>
                        <td className="py-3.5 text-xs text-slate-400 hidden sm:table-cell">
                          {player.role || 'Unspecified'}
                        </td>
                        <td className="py-3.5 font-bold font-mono text-white text-right">
                          ₹{player.totalCollected}
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          <div className="flex flex-col items-end gap-1.5">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded ${
                              isFullyPaid ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                              isPartiallyPaid ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                              'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                            }`}>
                              {isFullyPaid ? 'Charged' : isPartiallyPaid ? 'Pending' : 'Unpaid'}
                            </span>
                            {/* Little visual progress bar */}
                            <div className="w-20 bg-slate-950 rounded-full h-1 overflow-hidden">
                              <div 
                                className={`h-full ${isFullyPaid ? 'bg-emerald-400' : isPartiallyPaid ? 'bg-amber-400' : 'bg-rose-400'}`}
                                style={{ width: `${statusPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right pane: Outgoings & Expenses List */}
        <div className="lg:col-span-5 bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-display font-bold text-white uppercase tracking-tight">Bought Products</h3>
                <p className="text-xs text-slate-400 mt-0.5">Equipment & pitch booking costs</p>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-slate-950 border border-slate-850 text-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-400"
              >
                <option value="All" className="bg-slate-950">All Categories</option>
                <option value="Equipment" className="bg-slate-950">Equipment</option>
                <option value="Ground booking" className="bg-slate-950">Ground booking</option>
                <option value="Refreshments" className="bg-slate-950">Refreshments</option>
                <option value="Umpire Fees" className="bg-slate-950">Umpiring</option>
                <option value="Tournament Fee" className="bg-slate-950">Tournament</option>
                <option value="Other" className="bg-slate-950">Other</option>
              </select>
            </div>

            {/* Expenses Cards */}
            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {filteredExpenses.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  No matching team expenses.
                </div>
              ) : (
                filteredExpenses.map((expense) => (
                  <div key={expense.id} className="p-3 bg-slate-950/80 hover:bg-slate-950 border border-slate-850 rounded-xl flex items-start justify-between gap-3 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-indigo-400" />
                          {expense.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-550 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {expense.date}
                        </span>
                      </div>
                      
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-tight mt-1">{expense.productName}</h4>
                      {expense.notes && <p className="text-[11px] text-slate-450 italic">{expense.notes}</p>}
                      
                      <div className="text-[10px] text-slate-500">
                        Bought by <span className="text-slate-300 font-medium">{expense.purchasedBy}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="font-mono font-black text-rose-450 tracking-tight text-sm bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">
                        -₹{expense.cost}
                      </span>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => onDeleteExpense(expense.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-850 transition cursor-pointer"
                          title="Delete purchase log entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment Logs Ticker at bottom */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <ArrowRightCircle className="w-3.5 h-3.5 text-indigo-400" />
              Latest Payment History
            </h4>
            
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {paymentLogs.slice().reverse().slice(0, 4).map((log) => (
                <div key={log.id} className="text-xs flex items-center justify-between py-2 border-b border-dashed border-slate-800 last:border-0">
                  <div className="text-slate-400">
                    <span className="font-bold text-slate-200">{log.playerName}</span> contribution recorded
                  </div>
                  <div className="flex items-center gap-2">
                    {log.notes && <span className="text-[10px] text-slate-500 italic">({log.notes})</span>}
                    <span className="text-[10px] text-slate-500 font-mono">{log.date}</span>
                    <span className="font-bold text-emerald-400 font-mono text-right shrink-0">+₹{log.amount}</span>
                  </div>
                </div>
              ))}
              {paymentLogs.length === 0 && (
                <div className="text-xs text-slate-500 py-1 italic">No logged payments yet. Record the first contribution above!</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
