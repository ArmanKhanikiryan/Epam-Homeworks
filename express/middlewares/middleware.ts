import { NextFunction, Request, Response } from "express";
import { IMiddleware, IRequestUser } from "../utils/types";
import { validations } from "../utils/functions";


export default class Middleware implements IMiddleware{
  public apiMiddleware(req: Request, res: Response, next: NextFunction): void {
    const key = req.headers["api-key"];
    if (key === "qwerty123") {
      next();
    } else {
      res.status(401).json({ errorMessage: "Unauthorized User" });
    }
  }

  public validationMiddleware(req: Request, res: Response, next: NextFunction): void {
    if (req.method === 'DELETE' || 'GET' || 'PATCH'){
      next()
      return;
    }
    const { name, age, gender }: IRequestUser = req.body;
    if (validations({ name, age, gender })) {
      next();
    } else {
      res.status(400).json({ errorMessage: "Invalid User Info" });
    }
  }
}