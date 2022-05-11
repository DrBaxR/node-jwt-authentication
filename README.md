# Example Auth Flow Via JWT
From [this](https://www.youtube.com/watch?v=mbsmsi7l3r4).
```
$ npm init
$ npm run start
$ npm run startAuth
```

## Endpoints
### **Auth Server**
```POST localhost:4001/login``` get access and refresh tokens (access tokens expire after 15s)

```POST localhost:4001/token``` get new access token based on refresh token

```DELETE localhost:4001/logout``` invalidate refresh given token

### **API Server**
```GET localhost:3001/posts``` get posts of the logged in user
