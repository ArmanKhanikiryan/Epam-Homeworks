

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
  getUsers(): IUser[],
  createUser(data: IRequestUser): IUser,
  deleteUser(id: string): void,
  updateUser(id: string, data: IRequestUser): IUser | null,
  activvationUser(id: string) : IUser | null,
}