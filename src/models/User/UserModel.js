const { S3 } = require("../../config/key");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "user",
    {
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      profileImageName: {
        type: DataTypes.STRING(110),
        allowNull: false,
        defaultValue : `${S3.defaultImageDirectoryUrl}/0.png`,
      },
      nickname: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      status: {
        type: DataTypes.CHAR(1),
        defaultValue: "2",
        allowNull: false,
      },
      promiseRefusalMode: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      publicProfileMode: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      statusMessage: {
        type: DataTypes.STRING(100),
        default: ""
      },
      latitude: {
        type: DataTypes.DECIMAL(8, 6),
        defaultValue: 37.459651
      },
      longitude: {
        type: DataTypes.DECIMAL(9, 6),
        defaultValue: 126.951549,
      },
      inSchool: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      universityId: {
        type: DataTypes.INTEGER.UNSIGNED,
        references: {
          model: "university",
          key: "id",
        },
        allowNull: false,
      },
      refreshToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      locationUpdatedAt:{
        type: DataTypes.DATE,
        allowNull:true
      }
    },
    {
      sequelize,
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
      tableName: "user",
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "userId" }],
        },
        {
          name: "id",
          using: "BTREE",
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
