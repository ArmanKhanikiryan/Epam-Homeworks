import express, { Request, Response, NextFunction, Router } from 'express';
import { UserController } from "../controller/userController";
import { IRequestUser } from "../utils/types";
import { validations } from "../utils/functions";


const router: Router = express.Router();
const controller: UserController = new UserController();

const apiMiddleWare = (req: Request, res: Response, next: NextFunction): void => {
  const key = req.headers['api-key'];
  if (key === 'qwerty123') {
    next();
  } else {
    res.status(401).json({ errorMessage: "Unauthorized User" });
  }
};

router.use(apiMiddleWare);

router.get('/users', (req, res, next) => res.json(controller.getUsers()));

router.post('/users', (req, res, next) => {
  const { age, name, gender }: IRequestUser = req.body;
  if (!validations({ name, age, gender })) {
    res.status(400).json({ errorMessage: 'Invalid User Info' });
    return;
  }
  const createdUser = controller.createUser({ age, name, gender });
  res.status(201).json({ data: createdUser, message: "User Created" });
});

router.delete('/users/:id', (req, res, next) => {
  const id = req.params.id;
  controller.deleteUser(id);
  res.status(205).json({ message: "User Deleted" });
});

router.put('/users/:id', (req, res, next) => {
  const { name, age, gender }: IRequestUser = req.body;
  if (!validations({ name, age, gender })) {
    res.status(400).json({ errorMessage: 'Invalid User Info' });
    return;
  }
  const id = req.params.id;
  const updated = controller.updateUser(id, { age, name, gender });
  if (!updated) {
    res.status(404).json({ errorMessage: 'User Not Found' });
  } else {
    res.json({ data: updated, message: 'User Updated' });
  }
});

router.patch('/users/:id/activation', (req, res, next) => {
  const id = req.params.id;
  const activationUser = controller.activvationUser(id);
  if (!activationUser) {
    res.status(404).json({ errorMessage: 'User Not Found' });
  } else {
    res.json({ data: activationUser, message: 'User Updated' });
  }
});

export default router;
