import { NextFunction, Request, Response } from "express";

export interface IUser {
  id: string,
  name: string,
  age: number,
  gender: string,
  status: boolean,
  creationData: string,
  modificationData: string
}

export interface IRequestUser {
  name: string,
  age: number,
  gender: string,
}

export interface IController {
  getUsers(req: Request, res: Response): Promise<void>
  deleteUser(req: Request, res: Response):Promise<void>
  createUser(req: Request, res: Response): Promise<void>
  updateUser(req: Request, res: Response): Promise<void>
  activationUser(req: Request, res: Response) : Promise<void>
}

export interface IService {
  getUsers(): Promise<IUser[]>
  createUser(data: IRequestUser): Promise<IUser>
  deleteUser(id: string):Promise<void>
  updateUser(id: string, data: IRequestUser): Promise<IUser>
  activateUser(id: string):Promise<IUser>
}

export interface IMiddleware{
  validationMiddleware(req: Request, res: Response, next: NextFunction): void
  apiMiddleware(req: Request, res: Response, next: NextFunction): void
}