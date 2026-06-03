const router = require('express').Router();
const ctrl = require('../controllers/teamController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', ctrl.createTeam);
router.get('/', ctrl.listTeams);
router.get('/search', ctrl.searchTeams);
router.get('/:id', ctrl.getTeamDetails);
router.get('/:id/report', ctrl.getTeamReport);
router.delete('/:id', ctrl.deleteTeam);
router.post('/:id/invite', ctrl.inviteAthlete);
router.post('/:id/join', ctrl.requestToJoin);
router.post('/:id/respond', ctrl.respondToRequest);
router.post('/:id/leave', ctrl.leaveTeam);
router.delete('/:id/remove/:athleteId', ctrl.removeMember);
router.post('/requests/:notificationId/action', ctrl.respondToRequestFromNotification);

module.exports = router;
