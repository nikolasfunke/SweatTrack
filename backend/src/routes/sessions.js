const router = require('express').Router();
const ctrl = require('../controllers/sessionController');
const auth = require('../middleware/auth');
const coachAccess = require('../middleware/coachAccess');

router.use(auth);
router.get('/', coachAccess, ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getOne);
router.patch('/:id/pre', ctrl.updatePre);
router.post('/:id/start', ctrl.start);
router.post('/:id/fluid', ctrl.logFluid);
router.patch('/:id/temp', ctrl.updateTemp);
router.post('/:id/finish', ctrl.finish);
router.post('/:id/analyze', ctrl.analyze);
router.delete('/:id', ctrl.delete);

module.exports = router;
