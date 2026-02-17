const leadRepository = require('../repositories/leadRepository');
const opportunityRepository = require('../repositories/opportunityRepository');

const getDashboardStats = (req, res) => {
    const leads = leadRepository.getAll();
    const opportunities = opportunityRepository.getAll();

    const totalLeads = leads.length;
    // Assuming 'Converted' status exists for leads, or checking if they have linked accounts
    // The auto-create logic makes all leads "converted" effectively, but let's stick to status.
    const convertedLeads = leads.filter(l => l.status === 'Converted').length;

    // Active deals: not won or lost
    const activeDeals = opportunities.filter(o =>
        o.stage !== 'Closed Won' && o.stage !== 'Closed Lost'
    ).length;

    const closedDeals = opportunities.filter(o => o.stage === 'Closed Won').length;

    const revenue = opportunities
        .filter(o => o.stage === 'Closed Won')
        .reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);

    // Calculate Weekly Trend (Last 7 days)
    const weekData = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayRevenue = opportunities
            .filter(o => o.stage === 'Closed Won' && (o.closeDate || o.createdAt).startsWith(dateStr))
            .reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);

        weekData.push({
            label: date.toLocaleDateString('en-US', { weekday: 'short' }),
            value: dayRevenue
        });
    }

    // Calculate Monthly Trend (Last 4 weeks)
    const monthData = [];
    for (let i = 3; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(start.getDate() - (i + 1) * 7);
        const end = new Date(now);
        end.setDate(end.getDate() - i * 7);

        const weekRevenue = opportunities
            .filter(o => {
                if (o.stage !== 'Closed Won') return false;
                const d = new Date(o.closeDate || o.createdAt);
                return d >= start && d < end;
            })
            .reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);

        monthData.push({
            label: `W${4 - i}`,
            value: weekRevenue
        });
    }

    res.json({
        totalLeads,
        convertedLeads,
        activeDeals,
        closedDeals,
        revenue,
        revenueTrends: {
            weekData,
            monthData
        }
    });
};

module.exports = { getDashboardStats };
