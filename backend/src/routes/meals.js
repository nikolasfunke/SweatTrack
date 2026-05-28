const router = require('express').Router();
const ctrl = require('../controllers/mealController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getOne);
router.delete('/:id', ctrl.delete);

module.exports = router;
