const { verifyToken } = require('../utils/jwtHelper');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.warn('Auth Failure: Authorization header missing');
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
        console.log(`[AuthMiddleware] Verifying token for request: ${req.method} ${req.url}`);
        const user = verifyToken(token);
        if (!user) {
            console.warn('[AuthMiddleware] Auth Failure: Token verification returned null (invalid)', { token: token?.substring(0, 10) + '...' });
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        console.log(`[AuthMiddleware] Auth Success: User ${user.email} (${user.id}) authenticated.`);
        req.user = user;
        next();
    } catch (error) {
        // Log EVERYTHING for diagnostics
        console.error('--- [AuthMiddleware] CRITICAL AUTH ERROR ---');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.expiredAt) console.error('Expired At:', error.expiredAt);
        console.error('Token Snippet:', token?.substring(0, 15) + '...');
        console.error('---------------------------');

        return res.status(401).json({
            message: 'Authentication failed',
            error: error.name,
            details: error.message,
            token_hint: token?.substring(0, 5) + '...'
        });
    }

};

const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};

module.exports = { authenticate, authorize };
