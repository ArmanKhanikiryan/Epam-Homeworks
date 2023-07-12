import fs from "fs/promises";
import { IUser, IRequestUser, IService } from "../utils/types";
import handleCreateUser from "../models/user";
import { dayHandler } from "../utils/functions";
import CustomError from "../error/error";

export class UserServices implements IService{
  private userFilePath = 'express/database/users.json';

  private async retrieveUsers(): Promise<IUser[]> {
    try {
      const data = await fs.readFile(this.userFilePath, 'utf-8')
      return data ? JSON.parse(data) : []
    }catch (e) {
      console.log('Error in database retrieving');
      throw e;
    }
  }

  private async storeUsers(users: IUser[]): Promise<void> {
    try {
      await fs.writeFile(this.userFilePath, JSON.stringify(users, null, 2))
    }catch (e) {
      console.log('Error in storing database');
      throw e;
    }
  }

  public async getUsers(): Promise<IUser[]> {
    try {
      return await this.retrieveUsers();
    }catch (e) {
      console.log('Error in getting users');
      throw e;
    }
  }

  public async createUser(data: IRequestUser): Promise<IUser>{
    try {
      const newUser = handleCreateUser(data)
      const allUsers = await this.retrieveUsers()
      allUsers.push(newUser)
      await this.storeUsers(allUsers)
      return newUser
    }catch (e) {
      console.log('Error in creating user');
      throw e;
    }
  }

  public async deleteUser(id: string): Promise<void> {
    try {
      let users = await this.retrieveUsers();
      const index = users.findIndex(user => user.id === id);
      if (index === -1) {
        throw new CustomError('User Not Found', 404);
      }
      users.splice(index, 1);
      await this.storeUsers(users);
    } catch (e) {
      console.log('Error in deleting users', e);
      throw new CustomError('Internal Server Error', 500);
    }
  }

  public async updateUser(id: string, data: IRequestUser): Promise<IUser> {
    try {
      let users = await this.retrieveUsers();
      const index = users.findIndex(user => user.id === id);
      if (index === -1) {
        throw new Error('User Not Found');
      }
      const updated: IUser = {
        ...users[index],
        ...data,
        modificationData: dayHandler()
      };
      users[index] = updated;
      await this.storeUsers(users);
      return updated;
    } catch (e) {
      console.log('Error in reading/writing Database', e);
      throw e;
    }
  }

  public async activateUser(id: string):Promise<IUser> {
    try {
      let users = await this.retrieveUsers();
      const index = users.findIndex(user => user.id === id);
      if (index === -1) {
        throw new Error('User Not Found');
      }
      const activated:IUser = {
        ...users[index],
        status: true,
        modificationData: dayHandler()
      }
      users[index] = activated;
      await this.storeUsers(users)
      return activated
    }catch(e){
      console.log('Error in reading/writing Database', e);
      throw e;
    }
  }

}