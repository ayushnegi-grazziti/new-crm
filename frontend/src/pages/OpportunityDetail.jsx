import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    ArrowLeft,
    Briefcase,
    DollarSign,
    Target,
    Building2,
    Calendar,
    GitBranch,
    ClipboardList,
    BarChart3,
    Package,
    Save,
} from 'lucide-react';
import { motion } from 'framer-motion';

const STAGE_CONFIG = {
    Prospect: { color: 'bg-sky-500/20 text-sky-600 border-sky-300', dot: 'bg-sky-500' },
    Qualification: { color: 'bg-violet-500/20 text-violet-600 border-violet-300', dot: 'bg-violet-500' },
    Proposal: { color: 'bg-amber-500/20 text-amber-600 border-amber-300', dot: 'bg-amber-500' },
    Negotiation: { color: 'bg-orange-500/20 text-orange-600 border-orange-300', dot: 'bg-orange-500' },
    'Closed Won': { color: 'bg-emerald-500/20 text-emerald-600 border-emerald-300', dot: 'bg-emerald-500' },
    'Closed Lost': { color: 'bg-rose-500/20 text-rose-600 border-rose-300', dot: 'bg-rose-500' },
    Review: { color: 'bg-indigo-500/20 text-indigo-600 border-indigo-300', dot: 'bg-indigo-500' },
};

const formatCurrency = (val) =>
    val || val === 0
        ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(val)
        : '—';

const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US') : '—';

const OpportunityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [opportunity, setOpportunity] = useState(null);
    const [account, setAccount] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        git: '',
        pmChecklist: '',
        qbrNotes: '',
        productIds: [],
        stage: 'Prospect',
    });

    useEffect(() => {
        if (!id) {
            setError('Invalid opportunity ID');
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [oppRes, prodRes] = await Promise.all([
                    api.get(`/opportunities/${id}`),
                    api.get('/products'),
                ]);

                if (!oppRes.data) {
                    throw new Error('Opportunity not found');
                }

                const opp = oppRes.data;

                setOpportunity(opp);
                setProducts(prodRes.data || []);

                setFormData({
                    git: opp.git || '',
                    pmChecklist: opp.pmChecklist || '',
                    qbrNotes: opp.qbrNotes || '',
                    productIds: opp.productIds || [],
                    stage: opp.stage || 'Prospect',
                });

                if (opp.accountId) {
                    const accRes = await api.get(`/accounts/${opp.accountId}`);
                    setAccount(accRes.data);
                }
            } catch (err) {
                console.error(err);
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    'Failed to load opportunity'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleSave = async () => {
        try {
            await api.patch(`/opportunities/${id}`, formData);
            alert('Saved successfully');
        } catch (err) {
            alert('Save failed');
        }
    };

    // -------------------------
    // Loading State
    // -------------------------
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#0a0f1a] transition-colors">
                <p>Loading opportunity...</p>
            </div>
        );
    }

    // -------------------------
    // Error State
    // -------------------------
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#0a0f1a] transition-colors">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-red-500">
                        {error}
                    </h2>
                    <Link to="/opportunities" className="text-indigo-500">
                        ← Back to pipeline
                    </Link>
                </div>
            </div>
        );
    }

    if (!opportunity) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#0a0f1a] transition-colors">
                <p>Opportunity not found</p>
            </div>
        );
    }

    const stageStyle = STAGE_CONFIG[formData.stage] || STAGE_CONFIG.Prospect;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative min-h-screen flex justify-center px-6 py-12 bg-slate-100 dark:bg-[#0a0f1a] transition-colors duration-500 overflow-hidden"
        >
            {/* Premium background layer */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0
                  bg-[radial-gradient(circle_at_50%_20%,rgba(99,102,241,0.12),transparent_60%)]
                  dark:bg-[radial-gradient(circle_at_50%_20%,rgba(99,102,241,0.18),transparent_65%)]" />
                <div className="absolute inset-0
                  bg-gradient-to-b from-transparent via-transparent
                  to-slate-200/40 dark:to-black/40" />
            </div>

            {/* Card */}
            <div className="max-w-3xl w-full bg-white dark:bg-[#111827] p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                        <ArrowLeft className="text-gray-700 dark:text-gray-200" />
                    </button>
                    <button
                        onClick={handleSave}
                        className="p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-700 transition"
                    >
                        <Save className="text-indigo-600 dark:text-indigo-300" />
                    </button>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                    {opportunity.name}
                </h1>

                {/* Stage + Value + Close Date */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className={`px-4 py-1 rounded-full text-sm font-semibold border ${stageStyle.color} shadow-sm`}>
                        {formData.stage}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {formatCurrency(opportunity.value)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {formatDate(opportunity.closeDate)}
                    </span>
                </div>

                {/* Account & Probability */}
                <div className="mb-6">
                    <p className="text-gray-600 dark:text-gray-300 mb-1">
                        <strong>Account:</strong> {account?.name || '—'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-1">
                        <strong>Probability:</strong> {opportunity.probability || '—'}%
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-1">
                        <strong>Description:</strong> {opportunity.description || '—'}
                    </p>
                </div>

                {/* GIT Notes */}
                <div className="mb-6">
                    <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-2">GIT</label>
                    <textarea
                        value={formData.git}
                        onChange={(e) => setFormData({ ...formData, git: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
                        placeholder="GIT details..."
                        rows={4}
                    />
                </div>

                {/* QBR Notes */}
                <div className="mb-6">
                    <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-2">OBR</label>
                    <textarea
                        value={formData.qbrNotes}
                        onChange={(e) => setFormData({ ...formData, qbrNotes: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
                        placeholder="QBR details..."
                        rows={4}
                    />
                </div>

                {/* PM Checklist */}
                <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-2">PM Checklist</label>
                    <textarea
                        value={formData.pmChecklist}
                        onChange={(e) => setFormData({ ...formData, pmChecklist: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
                        placeholder="PM Checklist..."
                        rows={4}
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default OpportunityDetail;
