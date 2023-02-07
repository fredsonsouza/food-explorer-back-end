const { Router } = require("express");

const DishesController = require("../controllers/DishesController");
const ensureAuthenticated = require("../middleware/ensureAuthenticated");

const dishesRoutes = Router();

function myMiddleware(request, response, next) {
  console.log("Você passou pelo middleware!");

  if (request.body.isAdmin != true && request.body.isAdmin != null) {
    return response.json({ message: "User unauthorized" });
  }

  next();
}
const dishesController = new DishesController();

dishesRoutes.use(ensureAuthenticated);

dishesRoutes.get("/", myMiddleware, dishesController.index);
dishesRoutes.post("/", myMiddleware, dishesController.create);
dishesRoutes.get("/:id", myMiddleware, dishesController.show);
dishesRoutes.delete("/:id", myMiddleware, dishesController.delete);

module.exports = dishesRoutes;
