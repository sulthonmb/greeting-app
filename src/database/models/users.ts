import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import { Database } from "../../config/database";
import { container } from "tsyringe";
import { RoleAttributes, RolesModel } from "./roles";

export interface UserAttributes {
  id: number;
  uuid: string;
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
  country: string;
  city: string;
  timezone: string;
  birth_date: string;
  phone_number?: string;
  gender?: string;
  uuid_role: string;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "updated_at"> {}

class UsersModel
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public uuid!: string;
  public first_name!: string;
  public last_name?: string;
  public email!: string;
  public password!: string;
  public country!: string;
  public city!: string;
  public timezone!: string;
  public birth_date!: string;
  public phone_number?: string;
  public gender?: string;
  public uuid_role!: string;
  public created_at!: Date;
  public updated_at?: Date;
  public deleted_at?: Date;

  public Role?: RoleAttributes;

  // Define associations
  static associate(models: { Role: typeof RolesModel }) {
    // Define a one-to-many relationship between User and Role
    UsersModel.belongsTo(models.Role, {
      foreignKey: "uuid_role",
      targetKey: "uuid",
      as: "Role",
      onDelete: "CASCADE",
    });
  }
}

const db = container.resolve(Database);

UsersModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    uuid_role: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "roles", // Role model
        key: "uuid",
      },
      onDelete: "CASCADE",
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
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },

  {
    sequelize: db.connection,
    tableName: "users",
    modelName: "Users",
    timestamps: true, // Since we're manually managing created_at and updated_at
    underscored: true, // Use snake_case in the database
    paranoid: true,
    createdAt: false,
    updatedAt: false,
    deletedAt: "deleted_at",
  },
);

UsersModel.associate({ Role: RolesModel });

export { UsersModel };
