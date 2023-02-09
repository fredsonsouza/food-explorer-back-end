const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const DiskStorage = require("../providers/DiskStorage");

class DishePictureController {
  async update(request, response) {
    const dishe_id = request.user.id;
    const pictureFilename = request.file.filename;

    const diskStorage = new DiskStorage();

    const dishe = await knex("dishes").where({ id: dishe_id }).first();

    if (!dishe) {
      throw new AppError("Somente administradores podem mudar a imagem", 401);
    }
    if (dishe.picture) {
      await diskStorage.deleteFile(dishe.picture);
    }

    const filename = await diskStorage.saveFile(pictureFilename);
    dishe.picture = filename;

    await knex("dishes").update(dishe).where({ id: dishe_id });

    return response.json(dishe);
  }
}
module.exports = DishePictureController;
