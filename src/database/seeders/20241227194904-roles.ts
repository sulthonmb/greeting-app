"use strict";
import { v4 as uuidv4 } from "uuid";
import { QueryInterface, Op, Sequelize } from "sequelize";
import bcrypt from "bcrypt";
import { ROLES } from "../../constants/roles";

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
      "roles",
      [
        {
          uuid: uuidv4(),
          name: ROLES.GENERAL_MANAGER.NAME,
          slug: ROLES.GENERAL_MANAGER.SLUG,
        },
        {
          uuid: uuidv4(),
          name: ROLES.AREA_MANAGER.NAME,
          slug: ROLES.AREA_MANAGER.SLUG,
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
      "roles",
      {
        slug: {
          [Op.in]: [ROLES.GENERAL_MANAGER.SLUG, ROLES.AREA_MANAGER.SLUG],
        },
      },
      {},
    );
  },
};
