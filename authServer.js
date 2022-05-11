require('dotenv').config();

const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');

app.use(express.json()); // so express can parse json

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

app.post('/login', (req, res) => {
  // Authenticate User...

  const username = req.body.username;
  const user = { name: username };

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken); // whenever refresh token gets created, add in to cache
  res.json({ accessToken, refreshToken });
})

app.listen(4001);
