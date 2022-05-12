require('dotenv').config();

const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');

app.use(express.json()); // so express can parse json

// Authorization middleware
const authenticateToken = (req, res, next) => {
  // Authorization: Bearer <TOKEN>
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token || !authHeader) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;
    next();
  })
}

const posts = [
  {
    username: 'andi',
    title: 'Post Andi',
  }, {
    username: 'jim',
    title: 'Post Jim',
  }
];

app.get('/posts', authenticateToken, (req, res) => {
  res.json(posts.filter(p => p.username === req.user.name));
})

app.listen(3001);
