const asyncHandler = require('express-async-handler');
const Notification = require('../../models/Notification/Notification');
const { mongoose } = require('mongoose');

const notificationController = {
  //----List All Notifications ----//
  fetchNotifications: asyncHandler(async (req, res) => {
    const notifications = await Notification.find();

    res.json(notifications);
  }),

  //---- Read Notification ----//
  readNotification: asyncHandler(async (req, res) => {
    //! Get the notification id from params
    const notificationId = req.params.notificationId;

    //! Check if id is valid
    const isValidId = mongoose.Types.ObjectId.isValid(notificationId);

    if (!isValidId) {
      throw new Error('Invalid notification id!');
    }

    await Notification.findByIdAndUpdate(
      notificationId,
      {
        isRead: true,
      },
      {
        new: true,
      }
    );

    res.json({
      message: 'Notification Read',
    });
  }),
};

module.exports = notificationController;
