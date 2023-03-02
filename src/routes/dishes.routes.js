const { Router } = require("express");
const multer = require("multer");
const uploadConfig = require("../configs/upload");

const DishesController = require("../controllers/DishesController");
const DishePictureController = require("../controllers/DishePictureController");
const ensureAuthenticated = require("../middleware/ensureAuthenticated");
const isAdmin = require("../middleware/ensureIsAdmin");

const dishesRoutes = Router();
const upload = multer(uploadConfig.MULTER);

const dishesController = new DishesController();
const dishePictureController = new DishePictureController();

dishesRoutes.use(ensureAuthenticated);

dishesRoutes.get("/", dishesController.index);
dishesRoutes.put("/", ensureAuthenticated, dishesController.update);
dishesRoutes.post("/", isAdmin, dishesController.create);
dishesRoutes.get("/:id", dishesController.show);
dishesRoutes.delete("/:id", dishesController.delete);

dishesRoutes.patch(
  "/picture",
  ensureAuthenticated,
  upload.single("picture"),
  dishePictureController.update
);

module.exports = dishesRoutes;
