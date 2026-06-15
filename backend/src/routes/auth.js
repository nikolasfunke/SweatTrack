const router = require('express').Router();
const ctrl = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/register', ctrl.registerRules, ctrl.register);
router.post('/login', ctrl.loginRules, ctrl.login);
router.get('/me', authMiddleware, ctrl.me);

// Verificação de e-mail (requer auth, mas NÃO requer verified)
router.post('/verify', authMiddleware, ctrl.verifyEmail);
router.post('/resend-verification', authMiddleware, ctrl.resendVerification);

module.exports = router;
