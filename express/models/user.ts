import { dayHandler } from "../utils/functions";
import { IRequestUser, IUser } from "../utils/types";
import { randomUUID } from "crypto";
export default function handleCreateUser(data: IRequestUser):IUser {
  return {
    ...data,
    id: randomUUID(),
    status: false,
    creationData: dayHandler(),
    modificationData: dayHandler()
  }
}