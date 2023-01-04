const { Router } = require("express");

const DishesController = require("../controllers/DishesController");

const dishesRoutes = Router();

function myMiddleware(request, response, next) {
  console.log("Você passou pelo middleware!");

  if (request.body.isAdmin != true && request.body.isAdmin != null) {
    return response.json({ message: "User unauthorized" });
  }

  next();
}
const dishesController = new DishesController();

dishesRoutes.get("/", myMiddleware, dishesController.index);
dishesRoutes.post("/:user_id", myMiddleware, dishesController.create);
dishesRoutes.get("/:id", myMiddleware, dishesController.show);
dishesRoutes.delete("/:id", myMiddleware, dishesController.delete);

module.exports = dishesRoutes;
