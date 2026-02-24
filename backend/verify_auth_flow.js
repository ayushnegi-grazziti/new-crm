const axios = require('axios');

const API_URL = 'http://localhost:5002/api';

async function verifyAuthFlow() {
    console.log('--- STARTING AUTH FLOW VERIFICATION ---');

    const credentials = {
        email: 'ayush.negi@grazziti.com',
        password: 'password123'
    };

    try {
        console.log(`1. Attempting login for ${credentials.email}...`);
        const loginRes = await axios.post(`${API_URL}/auth/login`, credentials);
        const { token, user } = loginRes.data;
        console.log('✅ Login successful.');
        console.log('   User ID:', user.id);
        console.log('   Token snippet:', token.substring(0, 15) + '...');

        console.log('\n2. Verifying token immediately...');
        const verifyRes = await axios.get(`${API_URL}/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Token verification successful.');
        console.log('   Verified User:', verifyRes.data.user.email);

        console.log('\n3. Checking Dashboard access...');
        const dashboardRes = await axios.get(`${API_URL}/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Dashboard access successful.');
        console.log('   Leads Count:', dashboardRes.data.totalLeads);

        console.log('\n--- AUTH FLOW VERIFICATION SUCCESSFUL ---');
    } catch (error) {
        console.error('\n❌ AUTH FLOW VERIFICATION FAILED');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('   Error message:', error.message);
        }
    }
}

verifyAuthFlow();
