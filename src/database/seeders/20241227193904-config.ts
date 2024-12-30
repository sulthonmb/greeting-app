"use strict";
import { v4 as uuidv4 } from "uuid";
import { QueryInterface, Op, Sequelize } from "sequelize";
import bcrypt from "bcrypt";
import { CONFIGS } from "../../constants/configs";

function hashPassword(password: string) {
  const salt = bcrypt.genSaltSync(parseInt(String(process.env.ROUND_SALT)));
  return bcrypt.hashSync(password, salt);
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    await queryInterface.bulkInsert(
      "configs",
      [
        {
          name: CONFIGS.GREETING_SYSTEM.NAME,
          configuration: JSON.stringify(CONFIGS.GREETING_SYSTEM.CONFIG),
        },
      ],
      {},
    );
  },

  async down(queryInterface: QueryInterface) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete(
      "configs",
      {
        name: CONFIGS.GREETING_SYSTEM.NAME,
      },
      {},
    );
  },
};
