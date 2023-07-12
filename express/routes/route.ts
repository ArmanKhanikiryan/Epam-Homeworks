import express, { Router } from 'express';
import { UserController } from "../controller/userController";
import Middleware from "../middlewares/middleware";

const router: Router = express.Router();

const controller: UserController = new UserController();
const { apiMiddleware, validationMiddleware } = new Middleware()

router.use(apiMiddleware);
router.use(validationMiddleware)


router.get('/users', controller.getUsers.bind(controller));
router.post('/users', controller.createUser.bind(controller));
router.delete('/users/:id', controller.deleteUser.bind(controller));
router.put('/users/:id', controller.updateUser.bind(controller));
router.patch('/users/:id/activation',controller.activationUser.bind(controller));

export default router;
