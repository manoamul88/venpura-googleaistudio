import React, { useState, useMemo } from 'react';
import { Player } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ShieldAlert, 
  Award, 
  Check, 
  Shirt,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RosterTabProps {
  players: Player[];
  onAddPlayer: (player: Omit<Player, 'id' | 'totalCollected'>) => void;
  onUpdatePlayer: (id: string, updatedFields: Partial<Omit<Player, 'id' | 'totalCollected'>>) => void;
  onDeletePlayer: (id: string) => void;
  isAdmin?: boolean;
}

export default function RosterTab({
  players,
  onAddPlayer,
  onUpdatePlayer,
  onDeletePlayer,
  isAdmin = false
}: RosterTabProps) {
  const [search, setSearch] = useState('');
  
  // Player Forms state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);

  // New Player Form State
  const [newName, setNewName] = useState('');
  const [newJersey, setNewJersey] = useState('');
  const [newRole, setNewRole] = useState('Batsman');
  const [newMobile, setNewMobile] = useState('');

  // Edit Player Form State
  const [editName, setEditName] = useState('');
  const [editJersey, setEditJersey] = useState('');
  const [editRole, setEditRole] = useState('Batsman');
  const [editMobile, setEditMobile] = useState('');

  // Role selections standard in Cricket
  const CRICKET_ROLES = [
    'Batsman',
    'Captain & Batsman',
    'Wicket-Keeper Batsman',
    'Bowler',
    'All-Rounder',
    'Vice-Captain & All-Rounder',
    'Spin Bowler',
    'Fast Bowler'
  ];

  // Search filter
  const filteredPlayers = useMemo(() => {
    return players.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      (p.role && p.role.toLowerCase().includes(search.toLowerCase())) ||
      (p.jerseyNumber && p.jerseyNumber.includes(search))
    );
  }, [players, search]);

  // Statistics
  const stats = useMemo(() => {
    const totalPlayers = players.length;
    const batsmen = players.filter(p => p.role?.toLowerCase().includes('batsman')).length;
    const bowlers = players.filter(p => p.role?.toLowerCase().includes('bowler')).length;
    const allRounders = players.filter(p => p.role?.toLowerCase().includes('all-rounder')).length;
    const wicketkeepers = players.filter(p => p.role?.toLowerCase().includes('keeper')).length;

    return { totalPlayers, batsmen, bowlers, allRounders, wicketkeepers };
  }, [players]);

  // Handle Add Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    onAddPlayer({
      name: newName,
      jerseyNumber: newJersey,
      role: newRole,
      mobileNumber: newMobile
    });

    // Reset Form
    setNewName('');
    setNewJersey('');
    setNewRole('Batsman');
    setNewMobile('');
    setShowAddForm(false);
  };

  // Start Editing action
  const startEditing = (p: Player) => {
    setEditingPlayerId(p.id);
    setEditName(p.name);
    setEditJersey(p.jerseyNumber || '');
    setEditRole(p.role || 'Batsman');
    setEditMobile(p.mobileNumber || '');
  };

  // Handle Edit Submit
  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayerId || !editName) return;

    onUpdatePlayer(editingPlayerId, {
      name: editName,
      jerseyNumber: editJersey,
      role: editRole,
      mobileNumber: editMobile
    });

    setEditingPlayerId(null);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Stats Summary Panel */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-850 text-center">
          <span className="font-mono text-2xl font-black text-white">{stats.totalPlayers}</span>
          <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">Total Roster</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-850 text-center">
          <span className="font-mono text-2xl font-black text-indigo-400">{stats.batsmen}</span>
          <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">Batsmen</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-850 text-center">
          <span className="font-mono text-2xl font-black text-sky-400">{stats.bowlers}</span>
          <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">Bowlers</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-850 text-center">
          <span className="font-mono text-2xl font-black text-emerald-400">{stats.allRounders}</span>
          <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">All-Rounders</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-850 text-center col-span-2 md:col-span-1">
          <span className="font-mono text-2xl font-black text-amber-400">{stats.wicketkeepers}</span>
          <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">Wicketkeepers</p>
        </div>
      </div>

      {/* Main Roster Management Layout */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl">
        
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" /> Active Team Roster
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Customize player profiles, squad positions, and kit numbers</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, role or jersey..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 w-full md:w-64 text-xs bg-slate-950 border border-slate-800 text-slate-200 rounded-lg outline-none focus:border-indigo-400 transition"
              />
            </div>

            {isAdmin && (
              <button
                id="btn-add-player"
                type="button"
                onClick={() => { setShowAddForm(!showAddForm); setEditingPlayerId(null); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-md whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" /> Add Player
              </button>
            )}
          </div>
        </div>

        {/* Add Player Box */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-950/80 border border-slate-850 p-5 rounded-2xl mb-6 overflow-hidden"
            >
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Add Custom Squad Player</h3>
              <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end font-sans">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Jasprit Bumrah"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Jersey Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 93"
                    value={newJersey}
                    onChange={(e) => setNewJersey(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Squad Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-indigo-400"
                  >
                    {CRICKET_ROLES.map(role => (
                      <option key={role} value={role} className="bg-slate-950">{role}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mobile Number</label>
                  <input
                    required
                    type="text"
                    placeholder="9999999999"
                    value={newMobile}
                    onChange={(e) => setNewMobile(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs p-2.5 rounded-lg cursor-pointer transition text-center"
                  >
                    Add to Squad
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 border border-slate-800 bg-transparent text-slate-400 hover:text-white hover:bg-slate-800 text-xs rounded-lg transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Informative Help Box */}
        <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 text-xs text-indigo-305 flex items-start gap-2 mb-6">
          <Info className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
          <p className="text-slate-300">
            You have a squad of <strong>{players.length} players</strong> configured. You can adjust jersey numbers and core functions to reflect any roster substitution. These details are tied directly to match day availability RSVP selectors.
          </p>
        </div>

        {/* Players Grid list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 bg-slate-950/80 border border-dashed border-slate-800 rounded-2xl">
              <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs">No squad member matching your search query.</p>
            </div>
          ) : (
            filteredPlayers.map((player) => {
              const isEditing = player.id === editingPlayerId;
              
              return (
                <div 
                  key={player.id} 
                  className={`p-4 rounded-2xl border transition ${
                    isEditing 
                      ? 'border-indigo-500 bg-slate-950 shadow-xl' 
                      : 'border-slate-800/80 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/85'
                  }`}
                >
                  {isEditing ? (
                    <form onSubmit={handleEditSave} className="space-y-3.5 text-left font-sans">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Edit Name</label>
                        <input
                          required
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-indigo-400"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jersey No.</label>
                          <input
                            type="text"
                            value={editJersey}
                            onChange={(e) => setEditJersey(e.target.value)}
                            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-indigo-400"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Squad Role</label>
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-indigo-400 font-sans"
                          >
                            {CRICKET_ROLES.map(role => (
                              <option key={role} value={role} className="bg-slate-950">{role}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</label>
                          <input
                            required
                            type="text"
                            value={editMobile}
                            onChange={(e) => setEditMobile(e.target.value)}
                            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-indigo-400"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-lg cursor-pointer text-center flex items-center justify-center gap-1 transition"
                        >
                          <Check className="w-3.5 h-3.5" /> Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPlayerId(null)}
                          className="px-3 py-2 border border-slate-800 rounded-lg text-slate-400 text-xs cursor-pointer hover:bg-slate-800 hover:text-white transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {/* Shirt kit icon visual */}
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full bg-slate-900 text-indigo-400 border border-indigo-500/10 flex items-center justify-center">
                            <Shirt className="w-5 h-5 text-indigo-400" />
                          </div>
                          {player.jerseyNumber && (
                            <span className="absolute -bottom-1 -right-1 bg-indigo-650 text-white font-mono text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-slate-900">
                              {player.jerseyNumber}
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-1.5">
                            {player.name}
                            {(player.role?.toLowerCase().includes('captain') || player.role === 'Captain & Batsman') && (
                              <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" title="Team Leadership Role" />
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{player.role || 'Cricket Player'}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[10px]">
                            <span className="text-indigo-300 font-mono font-bold">Ledger Balance: ₹{player.totalCollected}</span>
                            {player.mobileNumber && (
                              <span className="text-slate-500 font-mono">| {player.mobileNumber}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Options */}
                      {isAdmin && (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => startEditing(player)}
                            className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                            title="Edit member information"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove ${player.name} from your active roster? This will delete associated contribution state.`)) {
                                onDeletePlayer(player.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                            title="Delete player roster profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}
