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

export function dayHandler(): string {
  const now = new Date();
  let year = now.getFullYear();
  let month = ('0' + (now.getMonth() + 1)).slice(-2);
  let day = ('0' + now.getDate()).slice(-2);
  let hours = ('0' + now.getHours()).slice(-2);
  let minutes = ('0' + now.getMinutes()).slice(-2);
  let seconds = ('0' + now.getSeconds()).slice(-2);
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
}