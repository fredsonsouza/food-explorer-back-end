const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const DiskStorage = require("../providers/DiskStorage");

class DishePictureController {
  async update(request, response) {
    const dish_id = request.user.id;
    const pictureFilename = request.file.filename;

    const diskStorage = new DiskStorage();

    const dish = await knex("dishes").where({ id: dish_id }).first();

    if (!dish) {
      throw new AppError("Somente administradores podem mudar a imagem", 401);
    }
    if (dish.picture) {
      await diskStorage.deleteFile(dish.picture);
    }

    const filename = await diskStorage.saveFile(pictureFilename);
    dish.picture = filename;

    await knex("dishes").update(dish).where({ id: dish_id });

    return response.json(dish);
  }
}
module.exports = DishePictureController;
