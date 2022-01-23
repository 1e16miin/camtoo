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
        type: DataTypes.STRING(80),
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
        defaultValue: sequelize.NOW
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
      ],
    }
  );
};
