const { Router } = require("express");
const multer = require("multer");
const uploadConfig = require("../configs/upload");

const DishesController = require("../controllers/DishesController");
const DishPictureController = require("../controllers/DishPictureController");
const ensureAuthenticated = require("../middleware/ensureAuthenticated");
const isAdmin = require("../middleware/ensureIsAdmin");

const dishesRoutes = Router();
const upload = multer(uploadConfig.MULTER);

const dishesController = new DishesController();
const dishPictureController = new DishPictureController();

dishesRoutes.use(ensureAuthenticated);

dishesRoutes.get("/", ensureAuthenticated, dishesController.index);
dishesRoutes.put("/", ensureAuthenticated, dishesController.update);
dishesRoutes.post("/", upload.single("picture"), dishesController.create);
dishesRoutes.get("/:id", ensureAuthenticated, dishesController.show);
dishesRoutes.delete("/:id", dishesController.delete);

dishesRoutes.patch(
  "/picture",
  ensureAuthenticated,
  upload.single("picture"),
  dishPictureController.update
);

module.exports = dishesRoutes;
