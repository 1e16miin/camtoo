module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "area",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      x: {
        type: DataTypes.DECIMAL(8, 6),
        allowNull: false,
      },
      y: {
        type: DataTypes.DECIMAL(9, 6),
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
      tableName: "area",
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
