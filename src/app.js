const express = require('express')
const path = require('path')
const { sequelize } = require ('./models');


const authController = require('./api/controllers/AuthController');
const friendController = require("./api/controllers/FriendController");
const discoverController = require("./api/controllers/DiscoverController");
const userController = require("./api/controllers/UserController");



const app = express();

app.set('port', process.env.PORT || 8000);


sequelize
  .sync()
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {``
    console.error(err);
  });


// app.use(express.static(path.join(__dirname, "public")));
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.use('/auth', authController)
app.use('/friend', friendController)
app.use('/main', discoverController)
app.use('/user', userController)


app.get("/", function (req, res) {
  res.status(200).send({ message: "hello camtoo" });
});

app.use("/", function (req, res) {
  res.status(404).send({ errors: { message: "NOT FOUND" } });
});

app.listen(app.get('port'), () => {
  console.log(`${app.get('port')} 번 포트에서 대기 중`)
}) 