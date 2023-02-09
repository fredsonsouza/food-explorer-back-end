const { Router } = require("express");
const multer = require("multer");
const uploadConfig = require("../configs/upload");

const DishesController = require("../controllers/DishesController");
const DishePictureController = require("../controllers/DishePictureController");
const ensureAuthenticated = require("../middleware/ensureAuthenticated");

const dishesRoutes = Router();
const upload = multer(uploadConfig.MULTER);

function myMiddleware(request, response, next) {
  console.log("Você passou pelo middleware!");

  if (request.body.isAdmin != true && request.body.isAdmin != null) {
    return response.json({ message: "User unauthorized" });
  }

  next();
}
const dishesController = new DishesController();
const dishePictureController = new DishePictureController();

dishesRoutes.use(ensureAuthenticated);

dishesRoutes.get("/", myMiddleware, dishesController.index);
dishesRoutes.put("/", ensureAuthenticated, dishesController.update);
dishesRoutes.post("/", myMiddleware, dishesController.create);
dishesRoutes.get("/:id", myMiddleware, dishesController.show);
dishesRoutes.delete("/:id", myMiddleware, dishesController.delete);

dishesRoutes.patch(
  "/picture",
  ensureAuthenticated,
  upload.single("picture"),
  dishePictureController.update
);

module.exports = dishesRoutes;
