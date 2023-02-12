const knex = require("../database/knex");
const sqliteConnection = require("../database/sqlite");

class IgredientsController {
  async index(request, response) {
    const { user_id } = request.params;

    const ingredients = await knex("ingredients").where({ user_id });

    return response.json(ingredients);
  }

  async update(request, response) {
    const { ingredient_name } = request.body;
    const dishe_id = request.user.id;
    const database = await sqliteConnection();

    const ingredient = database.get(
      "SELECT * from ingredients WHERE id = (?) ",
      [dishe_id]
    );

    ingredient.ingredient_name = ingredient_name ?? ingredient.ingredient_name;

    await database.run(
      `
    UPDATE ingredients SET
    ingredient_name = ?
    WHERE id = ?`,
      [ingredient.ingredient_name, dishe_id]
    );

    return response.status(200).json();
  }
}
module.exports = IgredientsController;
