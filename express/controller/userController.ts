import { IRequestUser, IUser } from "../utils/types";
import handleCreateUser from "../models/user";
import fs from "fs/promises"


export class UserController {
  private users: IUser[]
  constructor() {
    this.users = []
    this.retrieveUsers()
    this.storeUsers()
  }
   getUsers(): IUser[] {
    return this.users
  }
  public createUser(data: IRequestUser): IUser {
    const newUser = handleCreateUser(data)
    this.users.push(newUser)
    this.storeUsers()
    return newUser
  }

  deleteUser(id: string): void {
    const filtered = this.users.filter(elem => elem .id !== id)
    this.users = filtered
    this.storeUsers()
  }

  updateUser(id: string, data: IRequestUser): IUser | null {
    const elementIndex = this.users.findIndex(elem => elem.id === id)
    if (elementIndex === -1) {
      return null
    }
    const updated:IUser = {
      ...this.users[elementIndex],
      ...data,
      modificationData: Date.now()
    }
    this.users[elementIndex] = updated
    this.storeUsers()
    return updated
  }
  activvationUser(id: string) : IUser | null {
    const elementIndex = this.users.findIndex(elem => elem.id === id)
    if (elementIndex === -1) {
      return null
    }
    const activated: IUser = {
      ...this.users[elementIndex],
      status: true
    }
    this.users[elementIndex] = activated
    this.storeUsers()
    return activated
  }
  private async retrieveUsers(): Promise<void> {
    try {
      const data = await fs.readFile('express/database/users.json', 'utf8')
      this.users = data ? JSON.parse(data) : [];
    }catch (e) {
      console.log('Error in reading DataBase', e);
    }
  }
  private async storeUsers(): Promise<void> {
    try {
      await fs.writeFile('express/database/users.json',JSON.stringify(this.users, null, 2))
    }catch (e) {
      console.log('Error in writning DataBase', e);
    }
  }
}