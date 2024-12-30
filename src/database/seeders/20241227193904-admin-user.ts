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

    const uuidRoleAdmin = uuidv4();
    await queryInterface.bulkInsert(
      "roles",
      [
        {
          uuid: uuidRoleAdmin,
          name: ROLES.SUPER_ADMIN.NAME,
          slug: ROLES.SUPER_ADMIN.SLUG,
        },
      ],
      {},
    );

    await queryInterface.bulkInsert(
      "users",
      [
        {
          uuid: uuidv4(),
          uuid_role: uuidRoleAdmin,
          first_name: "Admin",
          email: "admin@gmail.com",
          password: hashPassword("admin@123"),
          country: "Indonesia",
          city: "Jakarta",
          timezone: "Asia/Jakarta",
          birth_date: "02-07-1997",
          phone_number: "085706876773",
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
      "users",
      {
        uuid_role: {
          [Op.in]: Sequelize.literal(
            `(SELECT uuid FROM roles WHERE slug = "${ROLES.SUPER_ADMIN.SLUG}")`,
          ),
        },
      },
      {},
    );

    await queryInterface.bulkDelete(
      "roles",
      {
        slug: ROLES.SUPER_ADMIN.SLUG,
      },
      {},
    );
  },
};
