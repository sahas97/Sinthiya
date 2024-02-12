import { NextFunction, Request, Response } from "express";
import { body, ValidationChain, validationResult } from "express-validator";

//cheking the chain of validation and send validation response to the client
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) {
        break;
      } 
    }
    const errors = validationResult(req);
    //check weather the errors are present
    if (errors.isEmpty()) {
      return next();
    }
    return res.status(422).json({
      message: "Validation failed.",
      errors: errors.array(),
    });
  };
};

export const loginValidator = [
    body("email").trim().isEmail().withMessage("Email is required."),
    body("password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Password should contain at least 6 characters."),
  ];
  

export const signupValidator = [
  body("name").notEmpty().withMessage("Name is required."),
  ...loginValidator
];

export const chatCompletionValidator = [
  body("message").notEmpty().withMessage("Message  is required"),
];