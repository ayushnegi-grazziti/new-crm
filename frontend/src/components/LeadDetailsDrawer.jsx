import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Building2, User, Mail, Briefcase, Calendar, Clock, FileText, CheckCircle2, TrendingUp, XCircle, Link as LinkIcon, Edit3 } from 'lucide-react';
import { format } from 'date-fns';
import { useTheme } from '../context/ThemeContext';

const LeadDetailsDrawer = ({ isOpen, onClose, lead }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [activeTab, setActiveTab] = useState('OVERVIEW');
    const TABS = ['OVERVIEW', 'ENGAGEMENT', 'DOCUMENTS'];

    if (!lead) return null;

    // Helper to format dates safely
    const safeFormatDate = (dateString, formatStr = 'PPP') => {
        if (!dateString) return 'Not available';
        try {
            return format(new Date(dateString), formatStr);
        } catch (e) {
            return dateString;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0.5 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={`fixed top-0 right-0 h-full w-full max-w-lg md:max-w-xl lg:max-w-2xl shadow-2xl z-[200] flex flex-col overflow-hidden border-l ${isDark ? 'bg-[#0b0e14] border-gray-800 text-gray-200' : 'bg-white border-gray-200 text-gray-900'
                            }`}
                    >
                        {/* Drawer Header */}
                        <div className={`relative px-8 py-10 border-b overflow-hidden ${isDark ? 'border-gray-800 bg-[#121620]' : 'border-gray-100 bg-gray-50/80'}`}>
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />

                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-lg transform rotate-3 ${isDark ? 'bg-indigo-500/10 text-indigo-400 shadow-indigo-500/5 border border-indigo-500/20' : 'bg-white text-indigo-600 border border-indigo-100'}`}>
                                        <Building2 size={32} />
                                    </div>
                                    <div>
                                        <h2 className={`text-2xl font-black tracking-tight mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {lead.companyName || lead.account || 'Unknown Company'}
                                        </h2>
                                        <div className="flex items-center gap-3">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${lead.status === 'New' ? 'bg-blue-500/10 text-blue-500' :
                                                (lead.status === 'Converted' || lead.status === 'Closed Won') ? 'bg-emerald-500/10 text-emerald-500' :
                                                    lead.status === 'Closed Lost' ? 'bg-rose-500/10 text-rose-500' :
                                                        'bg-gray-500/10 text-gray-500'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full bg-current mr-2 ${lead.status === 'New' ? 'animate-pulse' : ''}`} />
                                                {lead.status || 'New'}
                                            </span>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                                Ref: {lead.id?.slice(-8).toUpperCase() || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link
                                        to={`/leads/${lead.id}/edit`}
                                        className={`p-3 rounded-2xl transition-all active:scale-90 ${isDark ? 'bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white' : 'bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-900 shadow-sm border border-gray-100'}`}
                                        title="Edit Lead"
                                    >
                                        <Edit3 size={20} strokeWidth={2.5} />
                                    </Link>
                                    <button
                                        onClick={onClose}
                                        className={`p-3 rounded-2xl transition-all active:scale-90 ${isDark ? 'bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white' : 'bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-900 shadow-sm border border-gray-100'
                                            }`}
                                    >
                                        <X size={20} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className={`flex px-8 border-b sticky top-0 z-10 ${isDark ? 'border-gray-800 bg-[#0b0e14]/80 backdrop-blur-md' : 'border-gray-100 bg-white/80 backdrop-blur-md'}`}>
                            {TABS.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab
                                        ? 'text-indigo-500'
                                        : 'text-gray-500 hover:text-gray-400'
                                        }`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTabLead"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Drawer Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto px-8 py-10 custom-scrollbar">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="space-y-12"
                                >
                                    {activeTab === 'OVERVIEW' && (
                                        <>
                                            {/* Section: Basic Information */}
                                            <section>
                                                <SectionTitle icon={User} title="Primary Contact & Entity" isDark={isDark} />
                                                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-[32px] border ${isDark ? 'bg-[#121620]/40 border-gray-800/60' : 'bg-gray-50/50 border-gray-200/50'}`}>
                                                    <DetailItem label="Account / Company" value={lead.companyName || lead.account} isDark={isDark} />
                                                    <DetailItem label="Department" value={lead.department} isDark={isDark} />
                                                    <DetailItem label="Contact Person" value={lead.contactName || lead.customerName} isDark={isDark} />
                                                    <DetailItem label="Job Title" value={lead.title || lead.jobTitle} isDark={isDark} />
                                                    <DetailItem label="Contact Email" value={lead.email || lead.customerEmail} isDark={isDark} isEmail />
                                                    <DetailItem label="Contact Phone" value={lead.phone} isDark={isDark} />
                                                    <DetailItem label="Lead Source/Type" value={lead.leadType} isDark={isDark} isCaps />
                                                </div>
                                            </section>

                                            {/* Section: Ownership & Management */}
                                            <section>
                                                <SectionTitle icon={Briefcase} title="Account Management" isDark={isDark} />
                                                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-[32px] border ${isDark ? 'bg-[#121620]/40 border-gray-800/60' : 'bg-gray-50/50 border-gray-200/50'}`}>
                                                    <DetailItem label="Sales Manager" value={lead.salesManager} isDark={isDark} />
                                                    <DetailItem label="Delivery Manager" value={lead.deliveryManager} isDark={isDark} />
                                                </div>
                                            </section>

                                            {/* Section: Estimates & Contract */}
                                            <section>
                                                <SectionTitle icon={FileText} title="Deal Estimates" isDark={isDark} />
                                                <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-[32px] border ${isDark ? 'bg-[#121620]/40 border-gray-800/60' : 'bg-gray-50/50 border-gray-200/50'}`}>
                                                    <DetailItem label="FTE Count" value={lead.fteCount} isDark={isDark} isMetric />
                                                    <DetailItem label="Non-FTE" value={lead.nonFte} isDark={isDark} isMetric />
                                                    <DetailItem label="Exp. Hours" value={lead.expectedHours} isDark={isDark} isMetric />
                                                    <DetailItem label="Contract" value={lead.contractType} isDark={isDark} isCaps />
                                                </div>
                                            </section>

                                            {lead.status === 'Closed Lost' && lead.lostReason && (
                                                <section>
                                                    <SectionTitle icon={XCircle} title="Loss Analysis" isDark={isDark} />
                                                    <div className={`p-6 rounded-[32px] border bg-rose-500/5 border-rose-500/10`}>
                                                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2 block">Reason for Loss</span>
                                                        <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                            {lead.lostReason}
                                                        </p>
                                                    </div>
                                                </section>
                                            )}
                                        </>
                                    )}

                                    {activeTab === 'ENGAGEMENT' && (
                                        <section className="space-y-8">
                                            <SectionTitle icon={Clock} title="Interaction Log" isDark={isDark} />
                                            <div className={`overflow-hidden rounded-[32px] border ${isDark ? 'bg-[#121620]/40 border-gray-800/60' : 'bg-gray-50/50 border-gray-200/50'}`}>
                                                <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-800/60' : 'border-gray-200/50'}`}>
                                                    <DetailItem label="Last Interaction" value={safeFormatDate(lead.lastConversationDate || lead.updatedAt)} isDark={isDark} />
                                                </div>
                                                <div className="p-6 space-y-6">
                                                    <div>
                                                        <span className={`block text-[10px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Conversation Summary</span>
                                                        <div className={`p-5 rounded-2xl text-sm leading-relaxed ${isDark ? 'bg-[#0b0e14] text-gray-300' : 'bg-white text-gray-700 shadow-sm border border-gray-200/50'}`}>
                                                            {lead.lastConversation || lead.description || 'No summary recorded.'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className={`block text-[10px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Internal Comments</span>
                                                        <div className={`p-5 rounded-2xl text-sm leading-relaxed ${isDark ? 'bg-[#0b0e14] text-gray-300' : 'bg-white text-gray-700 shadow-sm border border-gray-200/50'}`}>
                                                            {lead.comments || 'No internal comments.'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                    {activeTab === 'DOCUMENTS' && (
                                        <section className="space-y-8">
                                            <SectionTitle icon={LinkIcon} title="Assets & Links" isDark={isDark} />
                                            <div className={`grid grid-cols-1 gap-6 p-6 rounded-[32px] border ${isDark ? 'bg-[#121620]/40 border-gray-800/60' : 'bg-gray-50/50 border-gray-200/50'}`}>
                                                <LinkItem label="Pitch Deck / Proposal" url={lead.proposalLink} isDark={isDark} icon={FileText} />
                                                <LinkItem label="Costing / Estimates" url={lead.estimatesLink} isDark={isDark} icon={TrendingUp} />
                                            </div>

                                            <div className={`mt-12 p-8 rounded-[40px] border flex flex-col md:flex-row gap-8 justify-between items-start md:items-center ${isDark ? 'bg-[#0b0e14] border-gray-800/60' : 'bg-white border-gray-200/50 shadow-sm'}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                                        <Calendar size={18} className="text-indigo-500" />
                                                    </div>
                                                    <div>
                                                        <span className={`block text-[9px] font-black uppercase tracking-wider mb-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Lead Inception</span>
                                                        <span className={`text-sm font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{safeFormatDate(lead.createdAt || lead.createdDate)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                                        <Edit3 size={18} className="text-indigo-500" />
                                                    </div>
                                                    <div>
                                                        <span className={`block text-[9px] font-black uppercase tracking-wider mb-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Last Record Sync</span>
                                                        <span className={`text-sm font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{lead.lastModifiedBy || 'Automated Sync'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// Help sub-components
const SectionTitle = ({ icon: Icon, title, isDark }) => (
    <h3 className={`text-[10px] font-black tracking-[0.25em] uppercase mb-6 flex items-center gap-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        <div className={`w-1.5 h-1.5 rounded-full bg-indigo-500`} />
        {title}
    </h3>
);

const DetailItem = ({ label, value, isDark, isEmail, isMetric, isCaps }) => (
    <div className="flex flex-col">
        <span className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{label}</span>
        {value || value === 0 ? (
            <span className={`font-bold transition-colors ${isEmail ? 'text-indigo-500 hover:text-indigo-400 cursor-pointer text-sm truncate' : (isMetric ? 'text-lg text-indigo-400' : 'text-sm')} ${isDark ? 'text-gray-100' : 'text-gray-900'} ${isCaps ? 'uppercase' : ''}`}>
                {value}
            </span>
        ) : (
            <span className={`text-sm font-medium opacity-20 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>N/A</span>
        )}
    </div>
);

const LinkItem = ({ label, url, isDark, icon: Icon }) => (
    <div className={`flex items-center justify-between group p-3 -m-3 rounded-2xl transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-indigo-50/50'}`}>
        <div className="flex flex-col min-w-0">
            <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                {label}
            </span>
            {url ? (
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-500 hover:text-indigo-400 transition-colors truncate">
                    {url}
                </a>
            ) : (
                <span className={`text-sm font-medium opacity-20 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Not Provided</span>
            )}
        </div>
        {url && (
            <div className={`p-2.5 rounded-xl border transition-all ${isDark ? 'border-gray-800 bg-gray-800/50 text-gray-500 group-hover:text-indigo-400 group-hover:border-indigo-500/50' : 'border-gray-200 bg-white text-gray-400 group-hover:text-indigo-600 group-hover:border-indigo-200 shadow-sm'}`}>
                <Icon size={18} />
            </div>
        )}
    </div>
);

export default LeadDetailsDrawer;

