import Reminder from '../models/Reminder.js';

export const createReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.create({ userId: req.user._id, ...req.body });
    res.json(reminder);
  } catch (e) {
    next(e);
  }
};

export const getReminders = async (req, res, next) => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id }).sort({ time: 1 });
    res.json(reminders);
  } catch (e) {
    next(e);
  }
};

export const deleteReminder = async (req, res, next) => {
  try {
    await Reminder.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Reminder deleted.' });
  } catch (e) {
    next(e);
  }
};