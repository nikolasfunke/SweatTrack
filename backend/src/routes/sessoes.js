const router = require('express').Router();
const ctrl = require('../controllers/controladorSessoes');
const auth = require('../middleware/autenticacao');

router.use(auth);
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getOne);
router.patch('/:id/pre', ctrl.updatePre);
router.post('/:id/iniciar', ctrl.start);
router.post('/:id/liquido', ctrl.logFluid);
router.patch('/:id/temperatura', ctrl.updateTemp);
router.post('/:id/finalizar', ctrl.finish);
router.delete('/:id', ctrl.delete);

module.exports = router;
