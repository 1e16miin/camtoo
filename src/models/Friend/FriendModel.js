module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "friend",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      following_user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "user",
          key: "profile_id",
        },
      },
      followed_user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "user",
          key: "profile_id",
        },
      },
      status: {
        type: DataTypes.CHAR(1),
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
          name: "following_user_id",
          using: "BTREE",
          fields: [{ name: "following_user_id" }],
        },
        {
          name: "followed_user_id",
          using: "BTREE",
          fields: [{ name: "followed_user_id" }],
        },
      ],
    }
  );
};
