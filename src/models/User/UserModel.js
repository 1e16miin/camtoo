module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "user",
    {
      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      profile_image_url: {
        type: DataTypes.CHAR(36),
        allowNull: true,
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
      promise_refusal_mode: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      public_profile_mode: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      status_message: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      latitude: {
        type: DataTypes.DECIMAL(8, 6),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: true,
      },
      in_school: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      university_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        references: {
          model: "university",
          key: "id",
        },
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
          fields: [{ name: "user_id" }],
        },
      ],
    }
  );
};
