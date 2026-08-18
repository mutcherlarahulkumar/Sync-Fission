import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.id = decoded.id;
        // Tokens issued before roles existed have no `role` claim; treat those
        // as students, which is the least privileged option.
        req.role = decoded.role === 'tutor' ? 'tutor' : 'student';
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
};
