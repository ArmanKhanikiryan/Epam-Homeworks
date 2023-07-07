import { create_UUID } from "../utils/functions";
import { IRequestUser, IUser } from "../utils/types";

export default function handleCreateUser(data: IRequestUser):IUser {
  return {
    ...data,
    id: create_UUID(),
    status: false,
    creationData: Date.now(),
    modificationData: Date.now()
  }
}