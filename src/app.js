import express from 'express'
import path from 'path'

import authController from './api/controllers/AuthController';
import friendController from "./api/controllers/FriendController";
import geoFenceController from "./api/controllers/GeoFenceController";
import userController from "./api/controllers/UserController";

const app = express();

app.set('port', process.env.PORT || 443);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json())

app.use('/auth', authController)
app.use('/friend', friendController)
app.use('/main', geoFenceController)
app.use('/profile', userController)


app.get("/", function (req, res) {
  res.status(200).send({ message: "hello world" });
});

app.use("/", function (req, res) {
  res.status(404).send({ errors: { message: "NOT FOUND" } });
});

app.listen(app.get('port'), () => {
  console.log(`${app.get('port')} 번 포트에서 대기 중`)
}) 