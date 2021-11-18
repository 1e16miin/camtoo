const { TINYINT } = require("sequelize/types");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "boundary",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
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
      building_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "building",
          key: "id",
        },
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
