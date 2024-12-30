import { body } from "express-validator";

export const usersValidationRules = () => {
  return [
    // must not empty
    body("firstName").isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isLength({ min: 8 }),
    body("birthDate").isDate(),
    body("gender").isLength({ min: 1, max: 1 }),
    body("uuidRole").isString(),
  ];
};
