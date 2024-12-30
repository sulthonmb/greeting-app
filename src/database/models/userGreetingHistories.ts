import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import { Database } from "../../config/database";
import { container, injectable } from "tsyringe";

export interface UserGreetingHistoryAttributes {
  id: number;
  uuid: string;
  uuid_user: string;
  event: string;
  message: string;
  sent_via: string;
  sent_to: string;
  status: string;
  created_at: Date;
  updated_at: Date | null;
}

export interface UserGreetingHistoryCreationAttributes
  extends Optional<UserGreetingHistoryAttributes, "id" | "created_at"> {}

class UserGreetingHistoryModel
  extends Model<
    UserGreetingHistoryAttributes,
    UserGreetingHistoryCreationAttributes
  >
  implements UserGreetingHistoryCreationAttributes
{
  public id!: number;
  public uuid!: string;
  public uuid_user!: string;
  public event!: string;
  public message!: string;
  public sent_via!: string;
  public sent_to!: string;
  public status!: string;
  public created_at!: Date;
  public updated_at!: Date | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

const db = container.resolve(Database);

UserGreetingHistoryModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
    uuid_user: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    event: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sent_via: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sent_to: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: db.connection,
    modelName: "UserGreetingHistory",
    tableName: "user_greeting_histories",
    timestamps: false, // Disable default timestamps as we use custom ones
    underscored: true, // Use snake_case column names
  },
);

export { UserGreetingHistoryModel };
