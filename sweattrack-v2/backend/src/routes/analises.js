const router = require('express').Router();
const ctrl = require('../controllers/controladorAnalises');
const auth = require('../middleware/autenticacao');

router.use(auth);
router.get('/painel', ctrl.getDashboard);
router.get('/semanal', ctrl.getWeeklyReport);
router.get('/tendencia-hidratacao', ctrl.getHydrationTrend);
router.get('/historico-sessoes', ctrl.getSessionsHistory);

module.exports = router;
