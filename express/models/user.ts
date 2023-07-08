import { create_UUID, dayHandler } from "../utils/functions";
import { IRequestUser, IUser } from "../utils/types";

export default function handleCreateUser(data: IRequestUser):IUser {
  return {
    ...data,
    id: create_UUID(),
    status: false,
    creationData: dayHandler(),
    modificationData: dayHandler()
  }
}