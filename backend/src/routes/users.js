const router = require('express').Router();
const ctrl = require('../controllers/userController');
const auth = require('../middleware/auth');
const verified = require('../middleware/verified');

router.use(auth);
router.use(verified);
router.put('/profile', ctrl.updateProfile);
router.put('/password', ctrl.changePassword);
router.get('/notifications', ctrl.getNotifications);
router.patch('/notifications/:id/read', ctrl.markNotificationRead);

module.exports = router;
