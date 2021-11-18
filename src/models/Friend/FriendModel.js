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
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
      },
      followed_user_id: {
        allowNull: false,
        references: {
          model: "user",
          key: "id",
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
      ],
    }
  );
};
