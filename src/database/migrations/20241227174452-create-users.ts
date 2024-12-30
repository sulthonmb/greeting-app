"use strict";
import { Sequelize, DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("users", {
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
        allowNull: false,
        primaryKey: false,
        type: DataTypes.STRING,
      },
      city: {
        allowNull: false,
        primaryKey: false,
        type: DataTypes.STRING,
      },
      timezone: {
        allowNull: false,
        primaryKey: false,
        type: DataTypes.STRING,
      },
      birth_date: {
        allowNull: false,
        primaryKey: false,
        type: DataTypes.DATEONLY,
      },
      phone_number: {
        type: DataTypes.STRING,
        primaryKey: false,
        allowNull: true,
      },
      gender: {
        type: DataTypes.STRING,
        primaryKey: false,
        allowNull: true,
      },
      uuid_role: {
        type: DataTypes.UUID,
        primaryKey: false,
        allowNull: false,
        references: {
          model: "roles",
          key: "uuid",
        },
        onDelete: "CASCADE",
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
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    });

    // Add indexes
    await queryInterface.addIndex("users", ["uuid"]);
    await queryInterface.addIndex("users", ["birth_date"]);
    await queryInterface.addIndex("users", ["timezone"]);
    await queryInterface.addIndex("users", ["uuid_role"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("users");
  },
};
