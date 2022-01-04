module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "time_table",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      scheduleName: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      dayOfTheWeek: {
        type: DataTypes.CHAR(1),
        allowNull: false,
      },
      scheduleType: {
        type: DataTypes.CHAR(1),
        allowNull: false,
      },
      startTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      endTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "user",
          key: "userId",
        },
      },
    },
    {
      sequelize,
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
      tableName: "time_table",
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
