

export interface IUser {
  id: string,
  name: string,
  age: number,
  gender: string,
  status: boolean,
  creationData: number,
  modificationData: number
}

export interface IRequestUser {
  name: string,
  age: number,
  gender: string,
}