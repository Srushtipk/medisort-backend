import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const tokenFor = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already used' });

    const user = await User.create({ name, email, password });
    res.json({ token: tokenFor(user._id), user: { id: user._id, name, email } });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ token: tokenFor(user._id), user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res) => {
  res.json(req.user);
};