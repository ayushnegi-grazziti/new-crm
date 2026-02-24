import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Shield, Globe, Users, Clock, Link as LinkIcon,
    MessageSquare, Save, Building2, Briefcase, FileText,
    GitBranch, Calendar, UserCheck, HardHat, DollarSign,
    ClipboardList
} from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const OpportunityDetailsDrawer = ({ isOpen, onClose, opportunityId, onUpdate }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [opportunity, setOpportunity] = useState(null);
    const [originalLead, setOriginalLead] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Notes State
    const [discussionNotes, setDiscussionNotes] = useState({
        products: '',
        notes: '',
        git: '',
        pmChecklist: '',
        qbrNotes: ''
    });

    useEffect(() => {
        if (isOpen && opportunityId) {
            fetchOpportunity();
        }
    }, [isOpen, opportunityId]);

    const fetchOpportunity = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/opportunities/${opportunityId}`);
            setOpportunity(res.data);
            setDiscussionNotes({
                products: res.data.products || '',
                notes: res.data.notes || '',
                git: res.data.git || res.data.gitLink || '',
                pmChecklist: res.data.pmChecklist || res.data.projectPlanLink || '',
                qbrNotes: res.data.qbrNotes || res.data.pmToolLink || ''
            });

            // If there's an original lead, fetch its basic info too
            if (res.data.originalLeadId) {
                try {
                    const leadRes = await api.get(`/leads/${res.data.originalLeadId}`);
                    setOriginalLead(leadRes.data);
                } catch (e) {
                    console.warn('Could not fetch original lead info');
                }
            }
        } catch (error) {
            console.error('Failed to fetch opportunity data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNotes = async () => {
        setSaving(true);
        try {
            await api.patch(`/opportunities/${opportunityId}`, discussionNotes);
            if (onUpdate) onUpdate();
            alert('Discussion notes saved successfully!');
        } catch (error) {
            console.error('Failed to save notes', error);
            alert('Error saving notes');
        } finally {
            setSaving(false);
        }
    };

    const InfoBlock = ({ label, value, icon: Icon, isCurrency }) => (
        <div className="space-y-1.5 flex flex-col group">
            <div className="flex items-center gap-1.5 text-[9px] font-black text-indigo-500 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                {Icon && <Icon size={12} />}
                {label}
            </div>
            <div className={`font-bold transition-colors ${isCurrency ? 'text-lg text-emerald-400' : 'text-sm'} ${isDark ? 'text-gray-200 group-hover:text-white' : 'text-gray-800'}`}>
                {isCurrency && (value || value === 0) ? `$${new Intl.NumberFormat().format(value)}` : (value || <span className="opacity-20 font-medium">Not specified</span>)}
            </div>
        </div>
    );

    const SectionHeader = ({ title, icon: Icon }) => (
        <div className={`flex items-center gap-3 mb-8 pt-10 first:pt-0 border-t first:border-t-0 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-500/10 text-indigo-500' : 'bg-indigo-50 text-indigo-600'}`}>
                <Icon size={18} />
            </div>
            <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{title}</h3>
        </div>
    );

    const drawerVariants = {
        hidden: { x: '100%', opacity: 0.5 },
        visible: { x: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 200 } },
        exit: { x: '100%', opacity: 0, transition: { duration: 0.3 } }
    };

    if (!isOpen && !opportunity) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className={`fixed inset-0 backdrop-blur-md z-[150] ${isDark ? 'bg-black/70' : 'bg-white/10'}`}
                    />

                    {/* Right-to-Left Drawer */}
                    <motion.div
                        variants={drawerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={`fixed top-0 right-0 h-screen w-full max-w-[550px] z-[160] overflow-hidden shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col ${isDark ? 'bg-[#0b0e14] border-l border-white/10' : 'bg-white border-l border-gray-200'
                            }`}
                    >
                        {/* Header */}
                        <div className={`p-10 border-b flex items-center justify-between relative overflow-hidden ${isDark ? 'border-white/5 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent' : 'border-gray-100 bg-indigo-50/30'}`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                            <div className="relative z-10">
                                <h2 className={`text-3xl font-black tracking-tight mb-2 leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {opportunity?.oppName || opportunity?.name || 'Deal Details'}
                                </h2>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                                        {opportunity?.stage || 'Pipeline'}
                                    </span>
                                    <p className={`text-[10px] font-bold tracking-[0.2em] uppercase ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                                        REF: {opportunityId?.slice(-8).toUpperCase()}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className={`p-4 rounded-2xl transition-all active:scale-90 border ${isDark ? 'bg-white/5 hover:bg-white/10 text-white/30 hover:text-white border-white/5' : 'bg-white hover:bg-gray-50 text-gray-400 border-gray-100 shadow-sm'}`}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                            {loading ? (
                                <div className="space-y-10 animate-pulse">
                                    <div className={`h-24 rounded-[32px] ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                                    <div className={`h-64 rounded-[32px] ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                                    <div className={`h-40 rounded-[32px] ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                                </div>
                            ) : (
                                <div className="space-y-16">
                                    {/* Core Metrics Highlight */}
                                    <section className={`grid grid-cols-2 gap-8 p-8 rounded-[40px] border shadow-inner ${isDark ? 'bg-gradient-to-br from-white/5 to-transparent border-white/5' : 'bg-gray-50/50 border-gray-100'}`}>
                                        <InfoBlock label="Deal Value" value={opportunity?.value} icon={DollarSign} isCurrency />
                                        <InfoBlock label="Win Probability" value={opportunity?.probability ? `${opportunity.probability}%` : null} icon={Activity} />
                                        <InfoBlock label="Primary Contact" value={opportunity?.contactName || originalLead?.contactName} icon={Users} />
                                        <InfoBlock label="Close Date" value={opportunity?.closeDate ? new Date(opportunity.closeDate).toLocaleDateString() : null} icon={Calendar} />
                                    </section>

                                    {/* IDs & Core Mapping */}
                                    <section>
                                        <SectionHeader title="Entity Lineage" icon={Shield} />
                                        <div className="grid grid-cols-2 gap-y-10 gap-x-6 px-2">
                                            <InfoBlock label="Account" value={opportunity?.accountName || opportunity?.accountId} icon={Building2} />
                                            <InfoBlock label="Lead Source" value={opportunity?.originalLeadId} icon={FileText} />
                                            <InfoBlock label="Delivery Owner" value={opportunity?.deliveryOwner} icon={HardHat} />
                                            <InfoBlock label="Owner ID" value={opportunity?.ownerId} icon={UserCheck} />
                                        </div>
                                    </section>

                                    {/* Project Info */}
                                    <section>
                                        <SectionHeader title="Technical Scope" icon={Briefcase} />
                                        <div className="grid grid-cols-1 gap-10 px-2">
                                            <InfoBlock label="Service / Offering" value={opportunity?.service} />
                                            <InfoBlock label="Primary Team" value={opportunity?.primaryTeam} />
                                            <div className="space-y-2">
                                                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest opacity-60">Project Brief</span>
                                                <p className={`text-sm leading-relaxed p-5 rounded-2xl bg-white/5 border border-white/5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {opportunity?.description || 'No description provided.'}
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Capacity Planning */}
                                    <section>
                                        <SectionHeader title="Resource Allocation" icon={Activity} />
                                        <div className="grid grid-cols-2 gap-y-10 gap-x-6 px-2">
                                            <div className="flex flex-col gap-2">
                                                <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest opacity-70">FTE Strength</div>
                                                <div className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>{opportunity?.fteCount || 0}</div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest opacity-70">Variable Hours</div>
                                                <div className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>{opportunity?.nonFteHours || 0}</div>
                                            </div>
                                            <InfoBlock label="Engagement PM/AM" value={opportunity?.pmAm} icon={UserCheck} />
                                            <InfoBlock label="Expertise Required" value={opportunity?.skillTech} />
                                        </div>
                                    </section>

                                    {/* External Documentation */}
                                    <section>
                                        <SectionHeader title="Governance & Assets" icon={GitBranch} />
                                        <div className="grid grid-cols-1 gap-6 px-2">
                                            {[
                                                { label: 'GIT Architecture', val: opportunity?.git || opportunity?.gitLink, icon: GitBranch },
                                                { label: 'PM Checklist / Plan', val: opportunity?.pmChecklist || opportunity?.projectPlanLink, icon: ClipboardList },
                                                { label: 'QBR / Review Notes', val: opportunity?.qbrNotes || opportunity?.pmToolLink, icon: FileText },
                                                { label: 'Shared Project Drive', val: opportunity?.projectFolderLink, icon: Building2 }
                                            ].map((link, idx) => (
                                                <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border group transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 group-hover:text-indigo-400 transition-colors uppercase ${isDark ? 'text-white/20' : 'text-gray-400'}`}>{link.label}</span>
                                                        {link.val ? (
                                                            <a href={link.val} target="_blank" rel="noreferrer" className={`text-sm font-bold truncate flex items-center gap-2 ${isDark ? 'text-white/80 hover:text-white' : 'text-indigo-600 hover:text-indigo-700'}`}>
                                                                <link.icon size={12} className="text-indigo-500" /> {link.val}
                                                            </a>
                                                        ) : <span className={`text-sm italic ${isDark ? 'text-white/10' : 'text-gray-300'}`}>Not Available</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Discussion Notes */}
                                    <section className={`mt-16 pt-16 border-t ${isDark ? 'border-indigo-500/20' : 'border-gray-100'}`}>
                                        <SectionHeader title="Discussion Workbench" icon={MessageSquare} />
                                        <div className="space-y-10 px-2">
                                            <div className="grid grid-cols-1 gap-6">
                                                <WorkbenchInput
                                                    label="GIT Architecture URL"
                                                    value={discussionNotes.git}
                                                    onChange={(val) => setDiscussionNotes({ ...discussionNotes, git: val })}
                                                    placeholder="https://..."
                                                    isDark={isDark}
                                                />
                                                <WorkbenchInput
                                                    label="PM Checklist / Plan URL"
                                                    value={discussionNotes.pmChecklist}
                                                    onChange={(val) => setDiscussionNotes({ ...discussionNotes, pmChecklist: val })}
                                                    placeholder="https://..."
                                                    isDark={isDark}
                                                />
                                                <WorkbenchInput
                                                    label="QBR / Review Notes URL"
                                                    value={discussionNotes.qbrNotes}
                                                    onChange={(val) => setDiscussionNotes({ ...discussionNotes, qbrNotes: val })}
                                                    placeholder="https://..."
                                                    isDark={isDark}
                                                />
                                                <WorkbenchInput
                                                    label="Products / SKUs"
                                                    value={discussionNotes.products}
                                                    onChange={(val) => setDiscussionNotes({ ...discussionNotes, products: val })}
                                                    placeholder="List products involved..."
                                                    isDark={isDark}
                                                />
                                            </div>

                                            <div className="group">
                                                <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 group-focus-within:text-indigo-500 transition-colors ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Detailed Session Notes</label>
                                                <textarea
                                                    className={`w-full border rounded-[32px] p-6 h-48 text-sm outline-none transition-all resize-none shadow-lg custom-scrollbar ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500 focus:bg-white/10' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-indigo-500 focus:bg-white'}`}
                                                    value={discussionNotes.notes}
                                                    onChange={(e) => setDiscussionNotes({ ...discussionNotes, notes: e.target.value })}
                                                    placeholder="Capture live interaction details..."
                                                />
                                            </div>
                                            <button
                                                onClick={handleSaveNotes}
                                                disabled={saving}
                                                className="w-full py-5 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-[24px] transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                                            >
                                                <Save size={20} />
                                                {saving ? 'Syncing...' : 'Save Workbench Changes'}
                                            </button>
                                        </div>
                                    </section>
                                </div>
                            )}
                        </div>

                        {/* Footer Context */}
                        <div className={`p-8 border-t bg-gradient-to-t from-black/20 to-transparent flex items-center justify-between ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                            <div className="flex flex-col">
                                <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Last System Sync</span>
                                <span className="text-[10px] font-bold text-indigo-400 capitalize">{opportunity?.updatedAt ? new Date(opportunity.updatedAt).toLocaleString() : 'Just Now'}</span>
                            </div>
                            {originalLead && (
                                <div className="text-right">
                                    <span className={`text-[9px] font-black uppercase tracking-widest mb-1 block ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Lead Origin</span>
                                    <span className={`text-[10px] font-bold italic ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{originalLead.companyName}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const Activity = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
);

const WorkbenchInput = ({ label, value, onChange, placeholder, isDark }) => (
    <div className="group">
        <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 group-focus-within:text-indigo-500 transition-colors ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</label>
        <input
            type="text"
            className={`w-full border rounded-2xl p-4 text-sm outline-none transition-all shadow-lg ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500 focus:bg-white/10' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-indigo-500 focus:bg-white'}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
        />
    </div>
);

export default OpportunityDetailsDrawer;

