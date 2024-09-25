const express = require('express');
const notificationController = require('../../controllers/notifications/notificationController');

//! Create instance express router
const notificationsRouter = express.Router();

//---- List Notifications ----//
notificationsRouter.get('/', notificationController.fetchNotifications);

//---- Read Notification ----//
notificationsRouter.put(
  '/:notificationId',
  notificationController.readNotification
);

module.exports = notificationsRouter;
