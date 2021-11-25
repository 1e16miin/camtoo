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
      class_name: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      day_of_the_week: {
        type: DataTypes.CHAR(1),
        allowNull: false,
      },
      class_type: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      start_time: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "user",
          key: "user_id",
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
