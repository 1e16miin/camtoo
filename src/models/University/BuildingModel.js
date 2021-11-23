

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "building",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      x: {
        type: DataTypes.DECIMAL(8, 6),
        allowNull: false,
      },
      y: {
        type: DataTypes.DECIMAL(8, 6),
        allowNull: false,
      },
      university_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "university",
          key: "id",
        },
      },
    },
    {
      sequelize,
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
      tableName: "building",
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
