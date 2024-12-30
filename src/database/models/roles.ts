import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import { Database } from "../../config/database";
import { container, injectable } from "tsyringe";

export interface RoleAttributes {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  created_at: Date;
  updated_at: Date | null;
}

export interface RoleCreationAttributes
  extends Optional<RoleAttributes, "id" | "created_at"> {}

class RolesModel
  extends Model<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes
{
  public id!: number;
  public uuid!: string;
  public name!: string;
  public slug!: string;
  public created_at!: Date;
  public updated_at!: Date | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

const db = container.resolve(Database);

RolesModel.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    uuid: {
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
      type: DataTypes.UUID,
    },
    name: {
      type: DataTypes.STRING,
    },
    slug: {
      type: DataTypes.STRING,
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: Sequelize.fn("NOW"),
    },
    updated_at: {
      allowNull: true,
      type: DataTypes.DATE,
    },
  },
  {
    sequelize: db.connection,
    tableName: "roles",
    modelName: "Roles",
    timestamps: false, // Since we're manually managing created_at and updated_at
    underscored: true, // Use snake_case in the database
  },
);

export { RolesModel };
