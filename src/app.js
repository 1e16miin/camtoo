import express from 'express'
import path from 'path'
import { sequelize } from './models';


import authController from './api/controllers/AuthController.js';
import friendController from "./api/controllers/FriendController.js";
import geoFenceController from "./api/controllers/GeoFenceController.js";
import userController from "./api/controllers/UserController.js";


const app = express();

app.set('port', process.env.PORT || 443);


sequelize
  .sync()
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error(err);
  });


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