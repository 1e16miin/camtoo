module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "friend",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      follower: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "user",
          key: "userId",
        },
      },
      followee: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "user",
          key: "userId",
        },
      },
      status: {
        type: DataTypes.CHAR(1),
        defaultValue: 1,
        allowNull: false,
      },
    },
    {
      sequelize,
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
      tableName: "friend",
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "follower",
          using: "BTREE",
          fields: [{ name: "follower" }],
        },
        {
          name: "followee",
          using: "BTREE",
          fields: [{ name: "followee" }],
        },
      ],
    }
  );
};
