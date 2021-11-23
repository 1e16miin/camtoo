"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "production";
const config = require(path.join(__dirname,'..','config','config.json'))[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.university = require("./University/UniversityModel")(sequelize, Sequelize);
db.building = require("./University/BuildingModel")(sequelize, Sequelize);
db.boundary = require("./University/BoundaryModel")(sequelize, Sequelize);
db.user = require("./User/UserModel")(sequelize, Sequelize);
db.friend = require("./Friend/FriendModel")(sequelize, Sequelize);
db.communication = require("./Interaction/CommunicationModel")(sequelize, Sequelize);

db.university.hasMany(db.building, {
  foreignKey: "university_id",
  sourceKey: "id",
});
db.building.belongsTo(db.university, {
  foreignKey: "university_id",
  targetKey: "id",
});

db.university.hasOne(db.user, {
  foreignKey: "university_id",
  sourceKey: "id",
});
db.user.belongsTo(db.university, {
  foreignKey: "university_id",
  targetKey: "id",
});

db.building.hasMany(db.boundary, {
  foreignKey: "building_id",
  sourceKey: "id",
});
db.boundary.belongsTo(db.building, {
  foreignKey: "building_id",
  targetKey: "id",
});

db.user.hasMany(db.friend, {
  foreignKey: "followed_user_id",
  sourceKey: "profile_id",
});

db.friend.belongsTo(db.user, {
  foreignKey: "followed_user_id",
  targetKey: "profile_id",
});

db.user.hasMany(db.friend, {
  foreignKey: "following_user_id",
  sourceKey: "profile_id",
});

db.friend.belongsTo(db.user, {
  foreignKey: "following_user_id",
  targetKey: "profile_id",
});

db.user.hasMany(db.communication, {
  foreignKey: "sender_id",
  sourceKey: "profile_id",
});

db.communication.belongsTo(db.user, {
  foreignKey: "sender_id",
  targetKey: "profile_id",
});

db.user.hasMany(db.communication, {
  foreignKey: "receiver_id",
  sourceKey: "profile_id",
});

db.communication.belongsTo(db.user, {
  foreignKey: "receiver_id",
  targetKey: "profile_id",
});

module.exports = db;
