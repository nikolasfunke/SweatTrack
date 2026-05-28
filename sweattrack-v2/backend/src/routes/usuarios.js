const router = require('express').Router();
const ctrl = require('../controllers/controladorUsuarios');
const auth = require('../middleware/autenticacao');

router.use(auth);
router.put('/perfil', ctrl.updateProfile);
router.put('/senha', ctrl.changePassword);
router.get('/notificacoes', ctrl.getNotifications);
router.patch('/notificacoes/:id/ler', ctrl.markNotificationRead);

module.exports = router;
