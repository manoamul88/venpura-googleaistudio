import React, { useState, useRef } from 'react';
import { Tournament, TournamentPlayerPayment, Player } from '../types';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Phone, 
  Upload, 
  Trash2, 
  Edit3, 
  Plus, 
  X, 
  DollarSign, 
  Check, 
  User, 
  Search, 
  Image as ImageIcon,
  CheckCircle,
  Clock,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TournamentsTabProps {
  players: Player[];
  tournaments: Tournament[];
  onUpdateTournaments: (tournaments: Tournament[]) => void;
  isAdmin: boolean;
}

// Some high-quality preset background images for tournament posters
const PRESET_POSTERS = [
  {
    name: 'Stadium Lights',
    url: 'https://images.unsplash.com/photo-1540747737956-378724044282?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Grass Turf',
    url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Golden Cup Winner',
    url: 'https://images.unsplash.com/photo-1578269174936-2709b5a8c040?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Team Circle',
    url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=600&auto=format&fit=crop'
  }
];

export default function TournamentsTab({ players, tournaments, onUpdateTournaments, isAdmin }: TournamentsTabProps) {
  // State for tracking active view & editors
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTournamentId, setEditingTournamentId] = useState<string | null>(null);
  
  // Tracking selected tournament for viewing the entry fee checklist
  const [selectedTrackerTourneyId, setSelectedTrackerTourneyId] = useState<string | null>(
    tournaments.length > 0 ? tournaments[0].id : null
  );

  // Player search inside fee tracker
  const [trackerSearch, setTrackerSearch] = useState('');

  // New Tournament / Editing Tournament Form State
  const [formName, setFormName] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formVenue, setFormVenue] = useState('');
  const [formFormat, setFormFormat] = useState<'T20' | 'ODI' | 'Sixes' | 'T10' | 'Tournament' | 'Local Trophy'>('T20');
  const [formEntryFee, setFormEntryFee] = useState<number>(500);
  const [formTotalTeamFee, setFormTotalTeamFee] = useState<string>('');
  const [formDescription, setFormDescription] = useState('');
  const [formOrganizerContact, setFormOrganizerContact] = useState('');
  const [formPosterUrl, setFormPosterUrl] = useState(PRESET_POSTERS[0].url);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  // File system refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle poster image conversion to Base64
  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormPosterUrl(reader.result);
          setPosterPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file selection manually
  const triggerFileSelection = () => {
    fileInputRef.current?.click();
  };

  // Initialize New Tournament Form
  const handleOpenAddForm = () => {
    setFormName('');
    setFormStartDate('');
    setFormEndDate('');
    setFormVenue('');
    setFormFormat('T20');
    setFormEntryFee(500);
    setFormTotalTeamFee('');
    setFormDescription('');
    setFormOrganizerContact('');
    setFormPosterUrl(PRESET_POSTERS[0].url);
    setPosterPreview(null);
    setEditingTournamentId(null);
    setShowAddForm(true);
  };

  // Edit Existing Tournament Loader
  const handleOpenEditForm = (t: Tournament) => {
    setFormName(t.name);
    setFormStartDate(t.startDate);
    setFormEndDate(t.endDate);
    setFormVenue(t.venue);
    setFormFormat(t.format);
    setFormEntryFee(t.entryFeePerPlayer);
    setFormTotalTeamFee(t.totalTeamEntryFee ? String(t.totalTeamEntryFee) : '');
    setFormDescription(t.description || '');
    setFormOrganizerContact(t.organizerContact || '');
    setFormPosterUrl(t.posterUrl || PRESET_POSTERS[0].url);
    setPosterPreview(t.posterUrl || null);
    setEditingTournamentId(t.id);
    setShowAddForm(true);
  };

  // Submit Form - Add/Edit handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formStartDate || !formVenue) return;

    if (editingTournamentId) {
      // Editing Mode
      const updated = tournaments.map(t => {
        if (t.id === editingTournamentId) {
          // Keep existing payments but ensure new team members are added or updated if needed
          const existingPayments = t.playerPayments || [];
          const updatedPayments: TournamentPlayerPayment[] = [...existingPayments];
          
          // Make sure all current roster players have a record
          players.forEach(p => {
            const hasRecord = updatedPayments.some(pay => pay.playerId === p.id);
            if (!hasRecord) {
              updatedPayments.push({
                playerId: p.id,
                playerName: p.name,
                amountPaid: 0,
                status: 'PENDING' as const
              });
            } else {
              // Update names if roster player name changed
              const payIndex = updatedPayments.findIndex(pay => pay.playerId === p.id);
              if (payIndex !== -1) {
                updatedPayments[payIndex].playerName = p.name;
              }
            }
          });

          return {
            ...t,
            name: formName,
            startDate: formStartDate,
            endDate: formEndDate || formStartDate,
            venue: formVenue,
            format: formFormat,
            entryFeePerPlayer: Number(formEntryFee),
            totalTeamEntryFee: formTotalTeamFee ? Number(formTotalTeamFee) : undefined,
            description: formDescription,
            organizerContact: formOrganizerContact,
            posterUrl: formPosterUrl,
            playerPayments: updatedPayments
          };
        }
        return t;
      });
      onUpdateTournaments(updated);
      setEditingTournamentId(null);
    } else {
      // Create Mode
      // Auto-populate payments registry for all current roster players
      const initialPayments: TournamentPlayerPayment[] = players.map(p => ({
        playerId: p.id,
        playerName: p.name,
        amountPaid: 0,
        status: 'PENDING' as const
      }));

      const newTourney: Tournament = {
        id: `t_${Date.now()}`,
        name: formName,
        startDate: formStartDate,
        endDate: formEndDate || formStartDate,
        venue: formVenue,
        format: formFormat,
        entryFeePerPlayer: Number(formEntryFee),
        totalTeamEntryFee: formTotalTeamFee ? Number(formTotalTeamFee) : undefined,
        description: formDescription,
        organizerContact: formOrganizerContact,
        posterUrl: formPosterUrl,
        playerPayments: initialPayments
      };
      
      const nextTourneys = [newTourney, ...tournaments];
      onUpdateTournaments(nextTourneys);
      // Auto-select the newly created tracker
      setSelectedTrackerTourneyId(newTourney.id);
    }

    setShowAddForm(false);
  };

  // Delete Tournament Handler
  const handleDeleteTournament = (id: string) => {
    if (window.confirm("Are you sure you want to remove this tournament? All payment logs for this tournament will be lost permanently.")) {
      const remaining = tournaments.filter(t => t.id !== id);
      onUpdateTournaments(remaining);
      if (selectedTrackerTourneyId === id) {
        setSelectedTrackerTourneyId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  // Entry Fee checklist interactions - Toggle user paid state
  const togglePlayerPaymentStatus = (tourneyId: string, playerId: string) => {
    if (!isAdmin) return; // Only Admin (Mano) can modify payments
    
    const updated = tournaments.map(t => {
      if (t.id === tourneyId) {
        const updatedPayments = t.playerPayments.map(p => {
          if (p.playerId === playerId) {
            const nextStatus: 'PENDING' | 'COLLECTED' = p.status === 'COLLECTED' ? 'PENDING' : 'COLLECTED';
            const nextAmount = nextStatus === 'COLLECTED' ? t.entryFeePerPlayer : 0;
            return {
              ...p,
              status: nextStatus,
              amountPaid: nextAmount,
              paidDate: nextStatus === 'COLLECTED' ? new Date().toISOString().split('T')[0] : undefined
            };
          }
          return p;
        });
        return { ...t, playerPayments: updatedPayments as TournamentPlayerPayment[] };
      }
      return t;
    });
    onUpdateTournaments(updated as Tournament[]);
  };

  // Custom Amount paid entry
  const updatePlayerPaymentAmount = (tourneyId: string, playerId: string, amount: number) => {
    if (!isAdmin) return;
    
    const updated = tournaments.map(t => {
      if (t.id === tourneyId) {
        const updatedPayments = t.playerPayments.map(p => {
          if (p.playerId === playerId) {
            const nextStatus: 'PENDING' | 'COLLECTED' = amount >= t.entryFeePerPlayer ? 'COLLECTED' : 'PENDING';
            return {
              ...p,
              amountPaid: amount,
              status: nextStatus
            };
          }
          return p;
        });
        return { ...t, playerPayments: updatedPayments as TournamentPlayerPayment[] };
      }
      return t;
    });
    onUpdateTournaments(updated as Tournament[]);
  };

  // Calculate stats for chosen tournament
  const activeTourney = tournaments.find(t => t.id === selectedTrackerTourneyId);
  
  const getTourneyStats = (t: Tournament) => {
    const registry = t.playerPayments || [];
    const totalCollected = registry.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    const expectedFromAll = players.length * t.entryFeePerPlayer;
    const paidCount = registry.filter(p => p.status === 'COLLECTED').length;
    const pendingCount = players.length - paidCount;
    const percent = expectedFromAll > 0 ? Math.round((totalCollected / expectedFromAll) * 100) : 0;
    
    return {
      totalCollected,
      expectedFromAll,
      paidCount,
      pendingCount,
      percent
    };
  };

  return (
    <div className="space-y-8" id="tournaments-tab-section">
      {/* Tab Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-wide uppercase text-xs mb-1">
            <Trophy className="w-4 h-4 text-amber-500 animate-pulse" />
            Tournament Campaign Tracker
          </div>
          <h2 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">
            Upcoming Tournaments & Entry Fees
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Admin <strong className="text-indigo-300">Mano</strong> has exclusive rights to create, edit tournament fixtures, upload creative banners, and record exact entry fee payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              id="btn-add-tournament"
              onClick={handleOpenAddForm}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-900/30 transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Tournament
            </button>
          )}
          {!isAdmin && (
            <div className="px-4 py-2 bg-slate-850 border border-slate-800 text-xs text-amber-400 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Viewing as Guest (Switch profile to Admin Mano to update fields)
            </div>
          )}
        </div>
      </div>

      {/* Admin Add/Edit Tournament Form Container */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 bg-slate-900 border border-indigo-500/20 rounded-2xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-indigo-400" />
                {editingTournamentId ? 'Edit Tournament Details' : 'Create Live Tournament Field'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                
                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-350 uppercase tracking-wider">
                    Tournament Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. TN State Club Premier Bowl"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150"
                  />
                </div>

                {/* Venue */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-350 uppercase tracking-wider">
                    Ground Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={formVenue}
                    onChange={e => setFormVenue(e.target.value)}
                    placeholder="e.g. Chepauk Cricket Oval, Pitch A"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150"
                  />
                </div>

                {/* Format selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-350 uppercase tracking-wider">
                    Game Format
                  </label>
                  <select
                    value={formFormat}
                    onChange={e => setFormFormat(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150"
                  >
                    <option value="T20">T20 (Standard Overs)</option>
                    <option value="ODI">ODI (50-overs)</option>
                    <option value="Sixes">Club Sixes (6-a-side)</option>
                    <option value="T10">T10 Fast Blast</option>
                    <option value="Tournament">Multi-round Cup</option>
                    <option value="Local Trophy">Local Trophy Derby</option>
                  </select>
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-350 uppercase tracking-wider">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150"
                  />
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-350 uppercase tracking-wider">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={e => setFormEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150"
                  />
                </div>

                {/* Contact phone */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-350 uppercase tracking-wider">
                    Organizer Contact Description
                  </label>
                  <input
                    type="text"
                    value={formOrganizerContact}
                    onChange={e => setFormOrganizerContact(e.target.value)}
                    placeholder="e.g. Ramesh (+91 9123456789)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150"
                  />
                </div>

                {/* Entry fee per player */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-350 uppercase tracking-wider">
                    Player Entry Fee Amount (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-slate-500 text-sm">₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formEntryFee}
                      onChange={e => setFormEntryFee(Number(e.target.value))}
                      placeholder="500"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150"
                    />
                  </div>
                </div>

                {/* Team flat entry fee */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-350 uppercase tracking-wider">
                    Flat Host Registration Team Fee (₹, Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-slate-500 text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={formTotalTeamFee}
                      onChange={e => setFormTotalTeamFee(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150"
                    />
                  </div>
                </div>

                {/* Description notes */}
                <div className="space-y-2 md:col-span-2 lg:col-span-1">
                  <label className="block text-xs font-semibold text-slate-350 uppercase tracking-wider">
                    Tourney Guidelines / Description
                  </label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    placeholder="Rules, match count, prize structure..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150"
                  />
                </div>
              </div>

              {/* POSTER DESIGN & UPLOAD ELEMENT */}
              <div className="space-y-3 bg-slate-950 p-5 rounded-xl border border-slate-850">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-350">
                    Tournament Poster Banner Design (Required)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload an aesthetic tournament brochure poster instantly or choose one of our elegant high-definition cricket backgrounds below.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* Select preset posters */}
                  <div className="md:col-span-5 space-y-3">
                    <div className="text-xs text-slate-400 font-medium">Quick Presets:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESET_POSTERS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormPosterUrl(preset.url);
                            setPosterPreview(preset.url);
                          }}
                          className={`p-2 rounded-lg border text-left text-xs transition duration-150 flex items-center gap-2 cursor-pointer ${
                            formPosterUrl === preset.url 
                              ? 'border-indigo-500 bg-indigo-900/20 text-indigo-300 font-bold' 
                              : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="w-8 h-8 rounded bg-cover bg-center shrink-0 border border-slate-850" style={{ backgroundImage: `url(${preset.url})` }}></div>
                          <span className="truncate">{preset.name}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 py-1">
                      <span className="h-px bg-slate-800 grow"></span>
                      <span className="text-[10px] text-slate-600 font-bold uppercase">or</span>
                      <span className="h-px bg-slate-800 grow"></span>
                    </div>

                    {/* File Upload Trigger */}
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handlePosterUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={triggerFileSelection}
                        className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-850 border border-dashed border-slate-700 hover:border-indigo-500 hover:text-indigo-400 text-slate-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Custom Poster File
                      </button>
                    </div>
                  </div>

                  {/* Poster Preview Frame */}
                  <div className="md:col-span-7 bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-center">
                    <div className="relative w-full h-40 rounded-lg overflow-hidden bg-slate-950 flex flex-col items-center justify-center text-center">
                      {formPosterUrl ? (
                        <>
                          <img
                            src={formPosterUrl}
                            alt="Tournament Poster Preview"
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                          <div className="relative z-10 px-4 mt-auto pb-4 w-full">
                            <span className="inline-block bg-indigo-500/80 text-[10px] uppercase tracking-wider font-extrabold text-white px-2 py-0.5 rounded mb-1">
                              {formFormat} Series
                            </span>
                            <h4 className="text-white font-bold text-sm truncate drop-shadow-md">
                              {formName || 'Tournament Presentation'}
                            </h4>
                            <p className="text-slate-300 text-xs truncate">
                              📍 {formVenue || 'Ground Pitch'}
                            </p>
                          </div>
                          {posterPreview && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormPosterUrl(PRESET_POSTERS[0].url);
                                setPosterPreview(null);
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-slate-950/80 hover:bg-red-950 hover:text-red-400 rounded-full text-slate-300 transition cursor-pointer"
                              title="Reset to default poster"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="text-slate-600 flex flex-col items-center">
                          <ImageIcon className="w-10 h-10 mb-2 stroke-1" />
                          <span className="text-xs">No banner selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-5 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 text-sm font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  {editingTournamentId ? 'Save Changes' : 'Launch Tournament'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid Layout for Tournaments List and the Active Tracker Sheet */}
      {tournaments.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center">
          <Trophy className="w-16 h-16 text-slate-700 mb-4 stroke-1" />
          <h3 className="text-lg font-bold text-slate-300">No upcoming tournament fixtures found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md">
            Click is allowed for admin Mano to create active tournaments and set entry fees for roster members. Once loaded, fixtures appear here.
          </p>
          {isAdmin && (
            <button
              onClick={handleOpenAddForm}
              className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create First Tournament
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: TOURNAMENT CARDS ROW (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Tournament Catalog ({tournaments.length})
            </h3>

            <div className="grid grid-cols-1 gap-5">
              {tournaments.map(t => {
                const isSelected = selectedTrackerTourneyId === t.id;
                const stats = getTourneyStats(t);

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTrackerTourneyId(t.id)}
                    className={`group bg-slate-900 rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex flex-col sm:flex-row ${
                      isSelected 
                        ? 'border-indigo-500/50 ring-1 ring-indigo-500/20' 
                        : 'border-slate-800 hover:border-slate-750'
                    }`}
                  >
                    {/* Poster section */}
                    <div className="w-full sm:w-44 h-40 sm:h-auto relative shrink-0 overflow-hidden bg-slate-950">
                      {t.posterUrl ? (
                        <img
                          src={t.posterUrl}
                          alt={t.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 sm:bg-gradient-to-r sm:from-transparent sm:to-slate-900/90 to-slate-950/40"></div>
                      
                      {/* Format Badge overlay */}
                      <span className="absolute top-3 left-3 bg-indigo-600/95 text-white font-extrabold text-[10px] tracking-widest uppercase px-2 py-0.5 rounded shadow">
                        {t.format}
                      </span>
                    </div>

                    {/* Details section */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        {/* Title and Edit Controls */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-slate-200 text-base leading-snug font-sans group-hover:text-indigo-400 transition-colors">
                            {t.name}
                          </h4>

                          {/* Admin actions */}
                          {isAdmin && (
                            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition duration-150 shrink-0 select-none">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditForm(t);
                                }}
                                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 transition cursor-pointer"
                                title="Edit layout details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTournament(t.id);
                                }}
                                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition cursor-pointer"
                                title="Delete tournament"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Date & Venue rows */}
                        <div className="space-y-1.5 mt-2">
                          <div className="text-slate-400 text-xs flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>
                              {t.startDate === t.endDate ? t.startDate : `${t.startDate} to ${t.endDate}`}
                            </span>
                          </div>
                          <div className="text-slate-400 text-xs flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 inline" />
                            <span className="truncate max-w-[240px] sm:max-w-[280px]">
                              {t.venue}
                            </span>
                          </div>
                          {t.organizerContact && (
                            <div className="text-slate-400 text-xs flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0 inline" />
                              <span className="truncate max-w-[240px] text-slate-350">
                                {t.organizerContact}
                              </span>
                            </div>
                          )}
                        </div>

                        {t.description && (
                          <p className="text-slate-500 text-xs mt-2 line-clamp-2 italic leading-relaxed">
                            "{t.description}"
                          </p>
                        )}
                      </div>

                      {/* Entry fee pricing meta row & collection bar */}
                      <div className="border-t border-slate-800/80 pt-3 flex flex-col gap-2">
                        {/* Cost & Collected summary */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="text-slate-400">
                            Player Fee: <strong className="text-emerald-400 font-bold font-sans">₹{t.entryFeePerPlayer}</strong>
                          </div>
                          <div className="text-slate-400 text-right">
                            Collected: <strong className="text-emerald-400 font-sans">₹{stats.totalCollected}</strong> <span className="text-slate-500 text-[10px]">/ ₹{stats.expectedFromAll} expected</span>
                          </div>
                        </div>

                        {/* Visual financial collection progression bar */}
                        <div>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden flex">
                            <div
                              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(stats.percent, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                            <span>Entry Fee Progress: {stats.percent}%</span>
                            <span className="text-indigo-400 font-semibold">
                              {stats.paidCount} paid, {stats.pendingCount} pending
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: LIVE ENTRY FEE CHECKLIST & TRACKER (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            {activeTourney ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
                
                {/* Header Banner representing selected Tourney */}
                <div className="p-5 bg-gradient-to-r from-slate-950 to-slate-900 border-b border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-10 translate-x-8 -translate-y-8 select-none pointer-events-none">
                    <Trophy className="w-full h-full text-white" />
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest">
                    <span>Entry Fee registry</span>
                    <span className="w-1 h-1 bg-indigo-500 rounded-full inline-block"></span>
                    <span className="text-slate-400">{activeTourney.format} match rules</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 font-sans tracking-tight mt-1 line-clamp-1">
                    {activeTourney.name}
                  </h3>

                  <div className="mt-2.5 flex items-center justify-between gap-3 bg-slate-900/60 p-2 text-xs rounded-xl border border-slate-850">
                    <div className="text-center flex-1">
                      <div className="text-slate-550 text-[10px] uppercase font-bold tracking-wider">Fee Per Head</div>
                      <div className="text-emerald-400 font-bold font-mono text-sm">₹{activeTourney.entryFeePerPlayer}</div>
                    </div>
                    <div className="border-l border-slate-800 h-6"></div>
                    <div className="text-center flex-1">
                      <div className="text-slate-550 text-[10px] uppercase font-bold tracking-wider">Paid amount</div>
                      <div className="text-slate-100 font-bold font-mono text-sm">₹{getTourneyStats(activeTourney).totalCollected}</div>
                    </div>
                    <div className="border-l border-slate-800 h-6"></div>
                    <div className="text-center flex-1">
                      <div className="text-slate-550 text-[10px] uppercase font-bold tracking-wider">Total Players</div>
                      <div className="text-indigo-400 font-bold font-mono text-sm">{players.length}</div>
                    </div>
                  </div>
                </div>

                {/* Player Payment List body container */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Roster Fee Log
                    </h4>

                    {/* Filter local Search bar */}
                    <div className="relative max-w-[140px] sm:max-w-[180px]">
                      <Search className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search player..."
                        value={trackerSearch}
                        onChange={e => setTrackerSearch(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs rounded-lg pl-8 pr-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 w-full transition duration-150"
                      />
                    </div>
                  </div>

                  {/* Payment Info Callout warning */}
                  <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 text-[11px] text-slate-350 rounded-lg flex items-center lg:items-start gap-2.5 leading-relaxed">
                    <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 inline-block mt-0.5" />
                    <span>
                      {isAdmin 
                        ? "Click Status Badges or adjust amount inputs below to instantly update payment collections for upcoming tournaments." 
                        : "Lodge entry status below. Guest profiles cannot submit changes, login to Admin Mano is required."}
                    </span>
                  </div>

                  {/* Real-time checklist scrollable segment */}
                  <div className="max-h-[380px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    {(() => {
                      const registry = activeTourney.playerPayments || [];
                      
                      // Filtered array to display
                      const list = players.filter(p => 
                        p.name.toLowerCase().includes(trackerSearch.toLowerCase())
                      );

                      if (list.length === 0) {
                        return (
                          <div className="py-8 text-center text-xs text-slate-600">
                            No team players found matching search.
                          </div>
                        );
                      }

                      return list.map(player => {
                        // Locate payment record or derive safe mock
                        const paymentRecord = registry.find(pay => pay.playerId === player.id) || {
                          playerId: player.id,
                          playerName: player.name,
                          amountPaid: 0,
                          status: 'PENDING' as const
                        };

                        const isPaid = paymentRecord.status === 'COLLECTED';

                        return (
                          <div
                            key={player.id}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                              isPaid 
                                ? 'bg-emerald-950/20 border-emerald-500/20 hover:bg-emerald-950/30' 
                                : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-950'
                            }`}
                          >
                            {/* Player Identity (Jersey + Name) */}
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-slate-850 flex items-center justify-center text-xs text-slate-300 font-bold border border-slate-800 shrink-0 font-mono">
                                {player.jerseyNumber || '#'}
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-slate-200 truncate font-sans">
                                  {player.name}
                                </h5>
                                <p className="text-[10px] text-slate-500 truncate">
                                  {player.role || 'Player'}
                                </p>
                              </div>
                            </div>

                            {/* Payment Control Area */}
                            <div className="flex items-center gap-2 shrink-0">
                              
                              {/* Amount input box (Admin only editable, otherwise text) */}
                              {isAdmin ? (
                                <div className="relative max-w-[70px] flex items-center bg-slate-900 border border-slate-800 hover:border-slate-700 focus-within:border-indigo-500 rounded-lg px-1 text-xs">
                                  <span className="text-[10px] text-slate-600">₹</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={paymentRecord.amountPaid}
                                    onChange={e => updatePlayerPaymentAmount(activeTourney.id, player.id, Number(e.target.value))}
                                    className="w-full bg-transparent border-0 px-1 py-1 text-slate-200 text-right focus:outline-none focus:ring-0 text-xs font-semibold font-mono"
                                  />
                                </div>
                              ) : (
                                <span className="text-xs font-bold font-mono text-slate-400 pr-1">
                                  ₹{paymentRecord.amountPaid}
                                </span>
                              )}

                              {/* Click togglable status Badge */}
                              <button
                                disabled={!isAdmin}
                                onClick={() => togglePlayerPaymentStatus(activeTourney.id, player.id)}
                                className={`px-2.5 py-1 text-[10px] font-extrabold uppercase font-sans tracking-wider rounded-lg transition-all flex items-center gap-1 shrink-0 ${
                                  isPaid 
                                    ? 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400 cursor-pointer' 
                                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-450 hover:bg-rose-500/20 cursor-pointer'
                                } ${!isAdmin ? 'opacity-85 pointer-events-none' : ''}`}
                              >
                                {isPaid ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    Paid
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3" />
                                    No
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Footer disclaimer summary logs */}
                <div className="p-4 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Logged Roster size: {players.length} players listed</span>
                  <span>Currency: INR (₹)</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-900 border border-dashed border-slate-800 rounded-2xl text-slate-500 flex flex-col items-center justify-center">
                <Clock className="w-10 h-10 mb-2 stroke-1 text-slate-700" />
                <span className="text-xs">Select a tournament to inspect and record player entry fee collections</span>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
