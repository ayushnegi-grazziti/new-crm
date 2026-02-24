import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Building2, Plus, Search, ExternalLink, ShieldCheck, ChevronDown, User, Mail, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatRelativeTime } from '../utils/dateUtils';

const AccountsList = () => {
    const [accounts, setAccounts] = useState([]);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedAccount, setExpandedAccount] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [accountsRes, leadsRes] = await Promise.all([
                    api.get('/accounts'),
                    api.get('/leads')
                ]);
                setAccounts(accountsRes.data);
                setLeads(leadsRes.data);
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredAccounts = accounts.filter(account =>
        account.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleExpand = (accountId) => {
        setExpandedAccount(expandedAccount === accountId ? null : accountId);
    };

    const getAccountLeads = (accountName) => {
        return leads.filter(l => (l.companyName || l.account) === accountName);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight text-glow">Accounts</h2>
                    <p className="text-[var(--text-secondary)] mt-1">Directory of enterprise partners with associated leads</p>
                </div>
                <button className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-500/20 opacity-50 cursor-not-allowed">
                    <Plus className="w-4 h-4 mr-2" />
                    New Account
                </button>
            </div>

            {/* List Container */}
            <div className="bg-[var(--card)] rounded-[32px] border border-[var(--input-border)] shadow-xl overflow-hidden">
                {/* Search Bar */}
                <div className="p-6 border-b border-[var(--input-border)]">
                    <div className="relative max-w-sm group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find an account..."
                            className="w-full pl-12 pr-4 py-3 bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--input-border)] rounded-2xl focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-[var(--text-secondary)] placeholder:opacity-50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* List Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--background)]/50 border-b border-[var(--input-border)]">
                                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--text-secondary)]">Organization Name</th>
                                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--text-secondary)]">Status</th>
                                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--text-secondary)] text-center">Leads</th>
                                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--text-secondary)] text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--input-border)]">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="4" className="px-8 py-8"><div className="h-4 bg-[var(--input-border)] rounded w-1/2 opacity-20"></div></td>
                                    </tr>
                                ))
                            ) : filteredAccounts.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center text-[var(--text-secondary)]">No accounts found.</td>
                                </tr>
                            ) : (
                                filteredAccounts.map(account => {
                                    const accountLeads = getAccountLeads(account.name);
                                    const isExpanded = expandedAccount === account.id;

                                    return (
                                        <React.Fragment key={account.id}>
                                            <tr className={`hover:bg-[var(--background)]/30 transition-all group ${isExpanded ? 'bg-[var(--background)]/50' : ''}`}>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center">
                                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mr-5 border border-indigo-500/10 shadow-inner group-hover:scale-110 transition-transform">
                                                            <Building2 size={24} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-[var(--text-primary)] text-lg leading-tight">{account.name}</div>
                                                            <div className="text-xs text-[var(--text-secondary)] flex items-center mt-1">
                                                                <ShieldCheck size={12} className="mr-1 text-emerald-500" /> Verified Partner
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="inline-flex items-center px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                                                        {account.status || 'Active'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <button
                                                        onClick={() => toggleExpand(account.id)}
                                                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${accountLeads.length > 0
                                                                ? 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20'
                                                                : 'bg-gray-500/5 text-gray-500 opacity-40'
                                                            }`}
                                                        disabled={accountLeads.length === 0}
                                                    >
                                                        {accountLeads.length} Leads
                                                        <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                                    </button>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <Link
                                                            to={`/accounts/${account.id}`}
                                                            className="inline-flex items-center px-4 py-2 bg-[var(--input-bg)] text-[var(--text-primary)] rounded-[14px] border border-[var(--input-border)] text-sm font-medium hover:bg-[var(--card)] hover:shadow-md transition-all active:scale-95"
                                                        >
                                                            View Account
                                                            <ExternalLink size={14} className="ml-2 opacity-50" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                            {/* Expandable Section */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <tr>
                                                        <td colSpan="4" className="p-0 border-none">
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden bg-[var(--background)]/20 shadow-inner"
                                                            >
                                                                <div className="px-12 py-6 space-y-3">
                                                                    <div className="text-[9px] uppercase font-black tracking-[0.2em] text-[var(--text-secondary)] opacity-40 mb-2">Associated Leads for {account.name}</div>
                                                                    {accountLeads.map(lead => (
                                                                        <div key={lead.id} className="flex items-center justify-between p-4 bg-[var(--card)] border border-[var(--input-border)] rounded-2xl hover:border-indigo-500/30 transition-all">
                                                                            <div className="flex items-center gap-4">
                                                                                <div className="w-10 h-10 rounded-full bg-indigo-500/5 flex items-center justify-center text-indigo-400">
                                                                                    <User size={18} />
                                                                                </div>
                                                                                <div>
                                                                                    <div className="font-bold text-sm text-[var(--text-primary)]">{lead.contactName || lead.customerName}</div>
                                                                                    <div className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
                                                                                        <Mail size={10} /> {lead.email || lead.customerEmail}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-6">
                                                                                <div className="flex flex-col items-end">
                                                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${lead.status === 'New' ? 'text-blue-500' : 'text-emerald-500'
                                                                                        }`}>{lead.status}</span>
                                                                                    <span className="text-[9px] text-[var(--text-secondary)] opacity-50 font-medium">Joined {formatRelativeTime(lead.createdAt)}</span>
                                                                                </div>
                                                                                <button className="p-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-indigo-500 hover:scale-105 transition-transform">
                                                                                    <Target size={14} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </AnimatePresence>
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination/Meta */}
            <div className="flex items-center justify-center gap-2 opacity-20 mt-4">
                <div className="w-8 h-[1px] bg-[var(--text-primary)]"></div>
                <div className="text-[30px] uppercase font-bold tracking-[0.4em] text-[var(--text-primary)]">🐧</div>
                <div className="w-8 h-[1px] bg-[var(--text-primary)]"></div>
            </div>
        </motion.div>
    );
};

export default AccountsList;
