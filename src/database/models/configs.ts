import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import { Database } from "../../config/database";
import { container } from "tsyringe";

export interface ConfigAttributes {
  id: number;
  name: string;
  configuration: any;
  created_at: Date;
  updated_at: Date | null;
}

export interface ConfigCreationAttributes
  extends Optional<ConfigAttributes, "id" | "updated_at"> {}

class ConfigsModel
  extends Model<ConfigAttributes, ConfigCreationAttributes>
  implements ConfigAttributes
{
  public id!: number;
  public name!: string;
  public configuration!: any;
  public created_at!: Date;
  public updated_at!: Date | null;
}

const db = container.resolve(Database);

ConfigsModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    configuration: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: db.connection,
    tableName: "configs",
    modelName: "Configs",
    timestamps: false, // Since we're manually managing created_at and updated_at
    underscored: true, // Use snake_case in the database
  },
);

export { ConfigsModel };
