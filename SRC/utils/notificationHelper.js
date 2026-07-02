const Notification =
require('../models/notificationSchema');

exports.createNotification =
async (
    userId,
    title,
    message,
    type = 'system'
) => {

    return await Notification.create({
        userId,
        title,
        message,
        type
    });

};