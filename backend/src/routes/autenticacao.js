const router = require('express').Router();
const ctrl = require('../controllers/controladorAutenticacao');
const authMiddleware = require('../middleware/autenticacao');

router.post('/registrar', ctrl.register);
router.post('/login', ctrl.login);
router.get('/eu', authMiddleware, ctrl.me);

module.exports = router;
