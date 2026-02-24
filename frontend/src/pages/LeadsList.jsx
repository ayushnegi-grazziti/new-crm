import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Building2, User, ChevronRight, Target, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatRelativeTime } from '../utils/dateUtils';
import { useTheme } from '../context/ThemeContext';
import LeadDetailsDrawer from '../components/LeadDetailsDrawer';

// Tooltip Component for reusable hover actions
const Tooltip = ({ children, text, isDark }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div
            className="relative flex items-center justify-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute -top-10 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shadow-lg z-50 pointer-events-none ${isDark ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'
                            }`}
                    >
                        {text}
                        <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${isDark ? 'bg-white' : 'bg-gray-900'
                            }`} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const LeadsList = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();

    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Drawer State
    const [selectedLead, setSelectedLead] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const response = await api.get('/leads');
            const data = response.data.length === 0 ? getDummyData() : response.data;

            // Sort by createdAt descending (newest first)
            const sortedLeads = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setLeads(sortedLeads);
        } catch (error) {
            console.error('Failed to fetch leads', error);
            setLeads(getDummyData().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDetails = (lead) => {
        setSelectedLead(lead);
        setIsDrawerOpen(true);
    };

    const handleMoveToOpportunity = (leadId) => {
        console.log("Moving to opportunity:", leadId);
        alert(`Initiating move to Opportunity for Lead ID: ${leadId}`);
    };

    const filteredLeads = leads.filter(lead =>
        (lead.companyName || lead.account || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.contactName || lead.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.customerEmail || lead.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`space-y-8 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
        >
            {/* Top Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Leads Dashboard</h2>
                    <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Manage and track your incoming prospects chronologically</p>
                </div>
                <Link
                    to="/leads/new"
                    className={`inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold uppercase tracking-wide text-sm transition-all shadow-lg active:scale-95 ${isDark
                        ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/20'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                        }`}
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create a Lead
                </Link>
            </div>

            {/* Search Toolbar */}
            <div className={`p-1 flex flex-col sm:flex-row items-center justify-between gap-4`}>
                <div className="relative w-full sm:max-w-md group">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-indigo-400' : 'text-gray-400 group-focus-within:text-indigo-600'}`} size={18} />
                    <input
                        type="text"
                        placeholder="Search leads, accounts, or emails..."
                        className={`w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none transition-all font-medium ${isDark
                            ? 'bg-[#0b0e14] text-gray-200 border border-gray-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 placeholder:text-gray-600'
                            : 'bg-white text-gray-900 border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-400'
                            }`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] opacity-60">
                    <Clock size={14} />
                    Newest First
                </div>
            </div>

            {/* Leads Table */}
            <div className={`rounded-[32px] border overflow-hidden transition-all duration-300 ${isDark ? 'bg-[#0b0e14] border-gray-800 shadow-2xl' : 'bg-white border-gray-100 shadow-xl'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`border-b ${isDark ? 'bg-[#121620]/30 border-gray-800' : 'bg-gray-50/50 border-gray-100'}`}>
                                <th className={`pl-8 pr-6 py-5 text-[10px] uppercase tracking-[0.15em] font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Lead Info</th>
                                <th className={`px-6 py-5 text-[10px] uppercase tracking-[0.15em] font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Account</th>
                                <th className={`px-6 py-5 text-[10px] uppercase tracking-[0.15em] font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Status</th>
                                <th className={`px-6 py-5 text-[10px] uppercase tracking-[0.15em] font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Created</th>
                                <th className={`px-8 py-5 text-[10px] uppercase tracking-[0.15em] font-bold text-right ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-gray-800/40' : 'divide-gray-50'}`}>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan="5" className="px-8 py-6">
                                            <div className={`h-4 rounded animate-pulse ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className={`p-24 text-center text-sm font-medium italic ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                        No leads found matching "{searchTerm}"
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id} className={`transition-colors group ${isDark ? 'hover:bg-[#121620]' : 'hover:bg-gray-50/80'}`}>
                                        {/* Lead Info */}
                                        <td className="pl-8 pr-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[14px] leading-snug">{lead.contactName || lead.customerName || 'N/A'}</span>
                                                <span className={`text-[11px] font-medium mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    {lead.email || lead.customerEmail || 'No Email'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Account */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                                    <Building2 size={14} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
                                                </div>
                                                <span className="font-bold text-[13px]">{lead.companyName || lead.account || 'Private'}</span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${lead.status === 'New' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                                (lead.status === 'Converted' || lead.status === 'Closed Won') ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                    lead.status === 'Closed Lost' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                                                        'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                                                }`}>
                                                <span className={`w-1 h-1 rounded-full bg-current mr-2 ${lead.status === 'New' ? 'animate-pulse shadow-[0_0_8px_currentColor]' : ''}`}></span>
                                                {lead.status || 'New'}
                                            </span>
                                        </td>

                                        {/* Created */}
                                        <td className="px-6 py-5">
                                            <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                {formatRelativeTime(lead.createdAt)}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <Tooltip text="Move to Opportunity" isDark={isDark}>
                                                    <button
                                                        onClick={() => handleMoveToOpportunity(lead.id)}
                                                        className={`p-2 rounded-xl transition-all shadow-sm ${isDark
                                                            ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 border border-blue-500/20'
                                                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 hover:scale-105'
                                                            }`}
                                                    >
                                                        <Target size={16} />
                                                    </button>
                                                </Tooltip>

                                                <Tooltip text="View Details" isDark={isDark}>
                                                    <button
                                                        onClick={() => handleOpenDetails(lead)}
                                                        className={`p-2 rounded-xl transition-all shadow-sm ${isDark
                                                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
                                                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:scale-105'
                                                            }`}
                                                    >
                                                        <ChevronRight size={16} />
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Slide-in Details Drawer */}
            <LeadDetailsDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                lead={selectedLead}
            />
        </motion.div>
    );
};

export default LeadsList;

// Helper to generate dummy data matching the new schema requirements
function getDummyData() {
    return [
        {
            id: 1,
            account_ID: 101,
            department: 'Enterprise Sales',
            createdAt: '2023-10-20T10:00:00Z',
            account: 'TechNova Solutions',
            companyName: 'TechNova Solutions',
            customerName: 'Sarah Jenkins',
            customerEmail: 'sarah.j@technova.example.com',
            email: 'sarah.j@technova.example.com',
            salesManager: 'Alexander Sterling',
            deliveryManager: 'Rachel Maas',
            leadType: 'Inbound',
            lastConversation: 'Client requested a demo of the new predictive analytics module. Follow up needed next week.',
            lastConversationDate: '2023-10-24T14:30:00Z',
            comments: 'High priority target. Budget seems flexible.',
            fteCount: 4.5,
            nonFte: 1.0,
            expectedHours: 720,
            contractType: 'Time & Materials',
            status: 'New',
        },
        {
            id: 2,
            account_ID: 102,
            department: 'SMB Segment',
            createdAt: '2023-10-15T09:15:00Z',
            account: 'GreenLeaf Retail',
            companyName: 'GreenLeaf Retail',
            customerName: 'David Cho',
            customerEmail: 'd.cho@greenleaf.example.com',
            email: 'd.cho@greenleaf.example.com',
            salesManager: 'Alexander Sterling',
            deliveryManager: 'Pending',
            leadType: 'Referral',
            lastConversation: 'Discussed basic rollout plan. Awaiting budget approval from their board.',
            lastConversationDate: '2023-10-18T11:00:00Z',
            comments: 'Very likely to convert if we can hit the Q4 deadline.',
            fteCount: 2.0,
            nonFte: 0.5,
            expectedHours: 320,
            contractType: 'Fixed Bid',
            status: 'Converted',
        }
    ];
}
