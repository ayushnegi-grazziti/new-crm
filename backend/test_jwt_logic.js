const { generateToken, verifyToken } = require('./utils/jwtHelper');

const testUser = {
    id: 'test-id',
    email: 'test@example.com',
    role: 'SALES_REP'
};

try {
    console.log('1. Testing token generation...');
    const token = generateToken(testUser);
    console.log('✅ Token generated:', token.substring(0, 15) + '...');

    console.log('\n2. Testing token verification...');
    const decoded = verifyToken(token);
    if (decoded.email === testUser.email && decoded.id === testUser.id) {
        console.log('✅ Token verification successful.');
        console.log('   Decoded user:', decoded.email);
    } else {
        throw new Error('Decoded data mismatch');
    }

    console.log('\n--- INTERNAL LOGIC VERIFICATION SUCCESSFUL ---');
} catch (error) {
    console.error('\n❌ INTERNAL LOGIC VERIFICATION FAILED');
    console.error('   Error:', error.message);
    process.exit(1);
}
