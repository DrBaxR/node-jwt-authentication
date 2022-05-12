// ? Setup
require('dotenv').config();

const express = require('express');
const app = express();

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

app.use(express.json()); // so express can parse json

// ? Authentication
const users = [];
app.get('/users', (req, res) => {
  res.json(users);
})

app.post('/users', async (req, res) => {
  try {
    // const salt = await bcrypt.genSalt(); // generate salt and after that use it to hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // bcrypt can generate salt & hash in one single step if you pass the rounds as second param

    const user = { name: req.body.name, password: hashedPassword };
    users.push(user);

    res.sendStatus(201);
  } catch {
    res.sendStatus(500);
  }
})

// ? Authorization
let refreshTokens = [] // would normally be stored in a database/redis cache
const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
}

app.post('/token', (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken });
  })
})

app.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter(t => t !== req.body.token);
  res.sendStatus(204);
})

app.post('/login', async (req, res) => {
  // Authenticate User...
  const user = users.find(u => u.name === req.body.name);
  if (!user) res.status(400).send('User does not exist');

  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      // For Authorization...
      // generate access token if user authenticated
      const accessToken = generateAccessToken(user);
      const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
      refreshTokens.push(refreshToken); // whenever refresh token gets created, add in to cache

      res.json({ accessToken, refreshToken });
    } else {
      res.sendStatus(403);
    }
  } catch {
    res.sendStatus(500);
  }
})

app.listen(4001);
