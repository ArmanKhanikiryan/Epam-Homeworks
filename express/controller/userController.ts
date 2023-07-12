import { IController, IRequestUser, IUser } from "../utils/types";
import { Request, Response } from 'express';
import { UserServices } from "../services/userServices";
import CustomError from "../error/error";

export class UserController implements IController{
  private userService: UserServices
  constructor() {
    this.userService = new UserServices()
  }
  public async createUser(req: Request, res: Response): Promise<void> {
    try{
      const { name, age, gender }: IRequestUser = req.body;
      const data = await this.userService.createUser({ name, age, gender })
      res.status(201).json({ data, message: "User Created" });
    }catch (e) {
      if (e instanceof CustomError){
        res.status(e.code).json({ errorMessage: e.message})
      }
      res.status(500).json({ errorMessage: 'Internal Server Error' });
    }
  }

  public async getUsers(req: Request, res: Response):Promise<void> {
    try {
      const result: IUser[] = await this.userService.getUsers()
      res.json(result)
    }catch (e) {
      if (e instanceof CustomError){
        res.status(e.code).json({ errorMessage: e.message})
      }
      res.status(500).json({ errorMessage: 'Internal Server Error' });
    }
  }

  public async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      await this.userService.deleteUser(id)
      res.status(205).json({ message: "User Deleted" });
    }catch (e) {
      if (e instanceof CustomError){
        res.status(e.code).json({ errorMessage: e.message})
      }
      res.status(500).json({ errorMessage: 'Internal Server Error' });
    }
  }

  public async updateUser(req: Request, res: Response):Promise<void> {
    try {
      const id = req.params.id
      const { name, age, gender }: IRequestUser = req.body;
      const data = await this.userService.updateUser(id,{ name, age, gender })
      res.json({ data, message: 'User Updated' });
    }catch(e){
      if (e instanceof CustomError){
        res.status(e.code).json({ errorMessage: e.message})
      }
      res.status(500).json({ errorMessage: 'Internal Server Error' });
    }
  }

  public async activationUser(req: Request, res: Response):Promise<void>{
    try {
      const id = req.params.id
      const data = await this.userService.activateUser(id)
      res.json({ data, message: 'User Activated' });
    }catch(e){
      if (e instanceof CustomError){
        res.status(e.code).json({ errorMessage: e.message})
      }
      res.status(500).json({ errorMessage: 'Internal Server Error' });
    }
  }
}