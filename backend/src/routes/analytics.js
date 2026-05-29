const router = require('express').Router();
const ctrl = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const coachAccess = require('../middleware/coachAccess');

router.use(auth);
router.use(coachAccess);
router.get('/dashboard', ctrl.getDashboard);
router.get('/weekly', ctrl.getWeeklyReport);
router.get('/hydration-trend', ctrl.getHydrationTrend);
router.get('/sessions-history', ctrl.getSessionsHistory);

module.exports = router;
