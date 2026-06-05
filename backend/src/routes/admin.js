const router = require('express').Router();
const auth = require('../middleware/auth');
const verified = require('../middleware/verified');
const requireAdmin = require('../middleware/requireAdmin');
const ctrl = require('../controllers/adminController');

router.use(auth);
router.use(verified);
router.use(requireAdmin);

router.get('/users', ctrl.listUsers);
router.patch('/users/:id/toggle-admin', ctrl.toggleAdmin);
router.post('/requests/:notificationId/action', ctrl.handleAdminRequest);

module.exports = router;
