const { TINYINT } = require("sequelize/types");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "university",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      x: {
        type: DataTypes.DECIMAL(8, 6),
        allowNull: false,
      },
      y: {
        type: DataTypes.DECIMAL(8, 6),
        allowNull: false,
      },
    },
    {
      sequelize,
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
      tableName: "auth",
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
