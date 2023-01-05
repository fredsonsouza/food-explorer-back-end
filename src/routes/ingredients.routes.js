const { Router } = require("express");

const IngredientsController = require("../controllers/IngredientsController");

const ingredientsRoutes = Router();

function myMiddleware(request, response, next) {
  console.log("Você passou pelo middleware!");

  if (request.body.isAdmin != true && request.body.isAdmin != null) {
    return response.json({ message: "User unauthorized" });
  }

  next();
}
const ingredientsController = new IngredientsController();

ingredientsRoutes.get("/:user_id", myMiddleware, ingredientsController.index);

module.exports = ingredientsRoutes;
