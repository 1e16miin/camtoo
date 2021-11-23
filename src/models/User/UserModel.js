module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "user",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
      },
      profile_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      profile_image_url: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      nickname: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      status_message: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      university_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        references: {
          model: "university",
          key: "id",
        },
        allowNull: false,
      },
      phone_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        references: {
          model: "phone",
          key: "id",
        },
        allowNull: false,
      },
      open_type: {
        type: DataTypes.CHAR(1),
        allowNull: false,
      },
      refresh_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
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
          fields: [{ name: "id" }],
        },
        {
          name: "profile_id",
          using: "BTREE",
          fields: [{ name: "profile_id" }],
        },
      ],
    }
  );
};
