"use strict";
import { Sequelize, DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("user_greeting_histories", {
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
      uuid_user: {
        type: DataTypes.UUID,
        primaryKey: false,
        allowNull: false,
        references: {
          model: "users",
          key: "uuid",
        },
        onDelete: "CASCADE",
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
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        allowNull: true,
        type: DataTypes.DATE,
      },
    });

    await queryInterface.addIndex("user_greeting_histories", ["created_at"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("user_greeting_histories");
  },
};
