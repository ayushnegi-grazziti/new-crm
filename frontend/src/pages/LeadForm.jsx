import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Building2, User, Briefcase, FileText, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const LeadForm = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [formData, setFormData] = useState({
        // Basic Info
        companyName: '',
        department: '',
        customerName: '',
        customerEmail: '',
        leadType: 'new',

        // Ownership
        salesManager: '',
        deliveryManager: '',

        // Engagement
        lastConversation: '',
        comments: '',

        // Estimates & Contract
        fteCount: '',
        nonFte: '',
        expectedHours: '',
        contractType: 't&m',
        status: 'New',
        lostReason: '',

        // Links
        proposalLink: '',
        estimatesLink: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Prepare data for backend
        const payload = {
            ...formData,
            fteCount: formData.fteCount ? parseFloat(formData.fteCount) : 0,
            nonFte: formData.nonFte ? parseFloat(formData.nonFte) : 0,
            expectedHours: formData.expectedHours ? parseFloat(formData.expectedHours) : 0,
            // Backend service expectations
            contactName: formData.customerName,
            email: formData.customerEmail,
            description: formData.lastConversation || formData.comments || ''
        };

        try {
            await api.post('/leads', payload);
            navigate('/leads');
        } catch (err) {
            console.error('Lead creation error:', err);
            const data = err.response?.data;
            const message = data?.message || data?.error || err.message || 'Failed to create lead';
            const details = data?.details || data?.error || '';

            setError(`${message}${details ? ': ' + details : ''}`);

            // If it's explicitly an auth issue, log helpful context
            if (err.response?.status === 401) {
                console.warn('Auth Error Details:', data);
            }
        } finally {
            setLoading(false);
        }
    };

    const SectionHeader = ({ icon: Icon, title }) => (
        <div className={`flex items-center gap-2 mb-6 pb-2 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
            <div className={`p-1.5 rounded-lg ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                <Icon size={18} />
            </div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{title}</h3>
        </div>
    );

    const inputClasses = `w-full p-3 rounded-xl border outline-none transition-all duration-200 text-sm font-medium ${isDark
        ? 'bg-[#121620] border-gray-800 text-gray-200 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50'
        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
        }`;

    const labelClasses = `block text-xs font-bold mb-1.5 uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`max-w-4xl mx-auto pb-20 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
        >
            <button
                onClick={() => navigate('/leads')}
                className={`flex items-center mb-6 font-semibold transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                    }`}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Leads Dashboard
            </button>

            <div className={`rounded-[32px] border shadow-2xl overflow-hidden p-8 md:p-10 ${isDark ? 'bg-[#0b0e14] border-gray-800' : 'bg-white border-gray-100'
                }`}>
                <div className="mb-8">
                    <h2 className={`text-3xl font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Create New Lead</h2>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Fill in the comprehensive details to track a new prospect.</p>
                </div>

                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-2xl mb-8 flex items-center text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">

                    {/* Basic Information */}
                    <section>
                        <SectionHeader icon={Building2} title="Basic Information" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Company Name (Account) *</label>
                                <input type="text" name="companyName" required className={inputClasses} value={formData.companyName} onChange={handleChange} placeholder="e.g. Acme Corp" />
                                <p className="text-[10px] mt-2 text-gray-500 italic">If this company already exists, the lead will be linked automatically.</p>
                            </div>
                            <div>
                                <label className={labelClasses}>Customer Name *</label>
                                <input type="text" name="customerName" required className={inputClasses} value={formData.customerName} onChange={handleChange} placeholder="John Doe" />
                            </div>
                            <div>
                                <label className={labelClasses}>Customer Email *</label>
                                <input type="email" name="customerEmail" required className={inputClasses} value={formData.customerEmail} onChange={handleChange} placeholder="john@acme.com" />
                            </div>
                            <div>
                                <label className={labelClasses}>Department</label>
                                <input type="text" name="department" className={inputClasses} value={formData.department} onChange={handleChange} placeholder="e.g. Enterprise Sales" />
                            </div>
                            <div>
                                <label className={labelClasses}>Lead Type</label>
                                <select name="leadType" className={inputClasses} value={formData.leadType} onChange={handleChange}>
                                    <option value="upshell">upshell</option>
                                    <option value="cross shell">cross shell</option>
                                    <option value="new">new</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Ownership */}
                    <section>
                        <SectionHeader icon={User} title="Ownership & Management" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClasses}>Sales Manager</label>
                                <input type="text" name="salesManager" className={inputClasses} value={formData.salesManager} onChange={handleChange} placeholder="Assigned Sales Rep" />
                            </div>
                            <div>
                                <label className={labelClasses}>Delivery Manager</label>
                                <input type="text" name="deliveryManager" className={inputClasses} value={formData.deliveryManager} onChange={handleChange} placeholder="Assigned Delivery Head" />
                            </div>
                        </div>
                    </section>

                    {/* Estimates & Contract */}
                    <section>
                        <SectionHeader icon={Briefcase} title="Estimates & Contract" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className={labelClasses}>FTE Count</label>
                                <input type="number" step="0.1" name="fteCount" className={inputClasses} value={formData.fteCount} onChange={handleChange} placeholder="0.0" />
                            </div>
                            <div>
                                <label className={labelClasses}>Non-FTE</label>
                                <input type="number" step="0.1" name="nonFte" className={inputClasses} value={formData.nonFte} onChange={handleChange} placeholder="0.0" />
                            </div>
                            <div>
                                <label className={labelClasses}>Expected Hours</label>
                                <input type="number" step="1" name="expectedHours" className={inputClasses} value={formData.expectedHours} onChange={handleChange} placeholder="0" />
                            </div>
                            <div>
                                <label className={labelClasses}>Contract Type</label>
                                <select name="contractType" className={inputClasses} value={formData.contractType} onChange={handleChange}>
                                    <option value="undefined">undefined</option>
                                    <option value="t&m">t&m</option>
                                    <option value="Bucket">Bucket</option>
                                    <option value="FTE">FTE</option>
                                    <option value="adhoc">adhoc</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Status & Engagement */}
                    <section>
                        <SectionHeader icon={FileText} title="Engagement & Status" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClasses}>Current Status</label>
                                <select name="status" className={inputClasses} value={formData.status} onChange={handleChange}>
                                    <option value="New">New</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Qualified">Qualified</option>
                                    <option value="Converted">Converted to Opportunity</option>
                                    <option value="Closed Lost">Closed Lost</option>
                                </select>
                            </div>
                            {formData.status === 'Closed Lost' && (
                                <div>
                                    <label className={`${labelClasses} text-rose-500`}>Lost Reason</label>
                                    <input type="text" name="lostReason" className={`${inputClasses} border-rose-500/30 focus:border-rose-500 focus:ring-rose-500/20`} value={formData.lostReason} onChange={handleChange} placeholder="Why did we lose this lead?" />
                                </div>
                            )}
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Last Conversation Notes</label>
                                <textarea name="lastConversation" className={`${inputClasses} h-24 resize-none`} value={formData.lastConversation} onChange={handleChange} placeholder="Summarize the latest interactions..." />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Additional Comments</label>
                                <textarea name="comments" className={`${inputClasses} h-24 resize-none`} value={formData.comments} onChange={handleChange} placeholder="Any general comments..." />
                            </div>
                        </div>
                    </section>

                    {/* Links */}
                    <section>
                        <SectionHeader icon={LinkIcon} title="Documents & Links" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClasses}>Proposal Link</label>
                                <input type="url" name="proposalLink" className={inputClasses} value={formData.proposalLink} onChange={handleChange} placeholder="https://..." />
                            </div>
                            <div>
                                <label className={labelClasses}>Estimates Link</label>
                                <input type="url" name="estimatesLink" className={inputClasses} value={formData.estimatesLink} onChange={handleChange} placeholder="https://..." />
                            </div>
                        </div>
                    </section>

                    <div className={`flex justify-end pt-8 mt-8 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex items-center px-8 py-3.5 rounded-xl font-bold uppercase tracking-wide text-sm transition-all shadow-lg active:scale-95 ${isDark
                                ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/20'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Save className="w-5 h-5 mr-2" />
                            {loading ? 'Creating Lead...' : 'Save Lead Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default LeadForm;
