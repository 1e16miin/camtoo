module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "communication",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      sender: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "user",
          key: "userId",
        },
      },
      receiver: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "user",
          key: "userId",
        },
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      messageType: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      sequelize,
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
      tableName: "communication",
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "sender",
          using: "BTREE",
          fields: [{ name: "sender" }],
        },
        {
          name: "receiver",
          using: "BTREE",
          fields: [{ name: "receiver" }],
        },
      ],
    }
  );
};
