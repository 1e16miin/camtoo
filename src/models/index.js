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

db.university = require("./Location/UniversityModel")(sequelize, Sequelize);
db.building = require("./Location/BuildingModel")(sequelize, Sequelize);
db.user = require("./User/UserModel")(sequelize, Sequelize);
db.friend = require("./Friend/FriendModel")(sequelize, Sequelize);
db.communication = require("./Interaction/CommunicationModel")(sequelize, Sequelize);
db.timeTable = require("./TimeTable/TimeTableModel")(sequelize, Sequelize)
db.entry = require("./Location/EntryModel")(sequelize,Sequelize)


db.university.hasMany(db.building, {
  foreignKey: "universityId",
  sourceKey: "id",
});
db.building.belongsTo(db.university, {
  foreignKey: "universityId",
  targetKey: "id",
});


db.university.hasOne(db.user, {
	foreignKey: "universityId",
  sourceKey: "id",
});
db.user.belongsTo(db.university, {
  foreignKey: "universityId",
  targetKey: "id",
});

db.building.hasMany(db.entry, {
  foreignKey: "buildingId",
  sourceKey: "id",
});
db.entry.belongsTo(db.building, {
  foreignKey: "buildingId",
  targetKey: "id",
});


db.user.hasMany(db.timeTable, {
	foreignKey: "userId",
	onDelete: "CASCADE",
	sourceKey: "userId",
});

db.timeTable.belongsTo(db.user, {
	foreignKey: "userId",
	onDelete: "CASCADE",
	targetKey: "userId",
});

db.user.hasMany(db.entry, {
	foreignKey: "userId",
	onDelete: "CASCADE",
	sourceKey: "userId",
});

db.entry.belongsTo(db.user, {
	foreignKey: "userId",
	onDelete: "CASCADE",
	targetKey: "userId",
});

db.user.hasMany(db.friend, {
	foreignKey: "followee",
	onDelete: "CASCADE",
	sourceKey: "userId",
});

db.friend.belongsTo(db.user, {
	foreignKey: "followee",
	onDelete: "CASCADE",
	targetKey: "userId",
});

db.user.hasMany(db.friend, {
	foreignKey: "follower",
	onDelete: "CASCADE",
	sourceKey: "userId",
});

db.friend.belongsTo(db.user, {
	foreignKey: "follower",
	onDelete: "CASCADE",
	targetKey: "userId",
});


db.user.hasMany(db.communication, {
	foreignKey: "sender",
	onDelete: "CASCADE",
	sourceKey: "userId",
});

db.communication.belongsTo(db.user, {
	foreignKey: "sender",
	onDelete: "CASCADE",
	targetKey: "userId",
});

db.user.hasMany(db.communication, {
	foreignKey: "receiver",
	onDelete: "CASCADE",
	sourceKey: "userId",
});

db.communication.belongsTo(db.user, {
	foreignKey: "receiver",
	onDelete: "CASCADE",
	targetKey: "userId",
});



module.exports = db;
