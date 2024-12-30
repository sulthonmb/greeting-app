import { body } from "express-validator";

export const loginValidationRules = () => {
  return [
    // must be an email
    body("email").isEmail(),
    // password must be at least 5 chars long
    body("password").isLength({ min: 8 }),
  ];
};
