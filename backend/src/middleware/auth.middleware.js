const admin = require('firebase-admin');

/**
 * Middleware to verify Firebase ID tokens
 */
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken; // Add decoded user info (uid, email, etc.) to request
        next();
    } catch (error) {
        console.error('Error verifying Firebase token:', error);
        res.status(403).json({ error: 'Invalid or expired token' });
    }
};

module.exports = verifyToken;
