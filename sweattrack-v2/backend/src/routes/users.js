const router = require('express').Router();
const ctrl = require('../controllers/userController');
const auth = require('../middleware/auth');

router.use(auth);
router.put('/profile', ctrl.updateProfile);
router.put('/password', ctrl.changePassword);
router.get('/notifications', ctrl.getNotifications);
router.patch('/notifications/:id/read', ctrl.markNotificationRead);

module.exports = router;
