const knex = require("../database/knex");

class DishesController {
  async create(request, response) {
    const { name, description, price, ingredients } = request.body;
    const { user_id } = request.params;

    const dishe_id = await knex("dishes").insert({
      name,
      description,
      price,
      user_id,
    });

    const ingredientsInsert = ingredients.map((name) => {
      return {
        dishe_id,
        name,
        user_id,
      };
    });
    await knex("ingredients").insert(ingredientsInsert);

    response.json();
  }
  async show(request, response) {
    const { id } = request.params;

    const dishe = await knex("dishes").where({ id }).first();
    const ingredients = await knex("ingredients")
      .where({ dishe_id: id })
      .orderBy("name");

    response.json({
      ...dishe,
      ingredients,
    });
  }

  async delete(request, response) {
    const { id } = request.params;

    await knex.raw("PRAGMA foreign_keys = ON");
    await knex("dishes").where({ id }).delete();

    return response.json();
  }
  async index(request, response) {
    const { user_id } = request.query;
    const dishes = await knex("dishes").where({ user_id }).orderBy("name");

    return response.json(dishes);
  }
}

module.exports = DishesController;
