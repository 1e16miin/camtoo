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
      sender_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "user",
          key: "profile_id",
        },
      },
      receiver_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "user",
          key: "profile_id",
        },
      },
      message: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
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
          name: "sender_id",
          using: "BTREE",
          fields: [{ name: "sender_id" }],
        },
        {
          name: "receiver_id",
          using: "BTREE",
          fields: [{ name: "receiver_id" }],
        },
      ],
    }
  );
};
