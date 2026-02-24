const axios = require('axios');

const API_URL = 'http://localhost:5002/api';

async function runTest() {
    console.log('--- STARTING COMPREHENSIVE ROUTE TEST ---');

    // 1. Test registration or login
    const creds = { email: 'ayush.negi@grazziti.com', password: 'password123' };

    try {
        console.log(`\n1. Attempting login for ${creds.email}...`);
        const loginRes = await axios.post(`${API_URL}/auth/login`, creds);
        const { token, user } = loginRes.data;
        console.log('✅ Login successful.');

        // 2. Test verify route
        console.log('\n2. Testing /auth/verify...');
        const verifyRes = await axios.get(`${API_URL}/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Verify successful:', verifyRes.data.user.email);

        // 3. Test dashboard stats
        console.log('\n3. Testing /dashboard stats...');
        const dashboardRes = await axios.get(`${API_URL}/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Dashboard stats fetched:', Object.keys(dashboardRes.data));

    } catch (err) {
        console.error('\n❌ TEST FAILED');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('Error:', err.message);
        }
    }
}

runTest();
