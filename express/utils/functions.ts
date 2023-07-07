import { IRequestUser } from "./types";


export function create_UUID(): string{
  let temp = new Date().getTime();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = (temp + Math.random()*16)%16 | 0;
    temp = Math.floor(temp/16);
    return (c=='x' ? r :(r&0x3|0x8)).toString(16);
  });
}

export function validations({ name, age, gender }: IRequestUser): boolean {
  if (!name || !age || !gender) {
    return false;
  }
  return !(name.length < 3 || age < 18 || (gender.toLowerCase() !== "male" && gender.toLowerCase() !== "female"));
}