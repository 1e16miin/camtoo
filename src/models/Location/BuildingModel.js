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
      latitude: {
        type: DataTypes.DECIMAL(8, 6),
        allowNull: false,
      },
      longitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: false,
      },
      radius: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      universityId: {
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
