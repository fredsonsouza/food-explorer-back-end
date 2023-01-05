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

    const ingredientsInsert = ingredients.map((ingredient_name) => {
      return {
        dishe_id,
        ingredient_name,
        user_id,
      };
    });
    await knex("ingredients").insert(ingredientsInsert);

    return response.json();
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
    const { name, user_id, ingredients } = request.query;

    let dishes;
    if (ingredients) {
      const filterIngredients = ingredients
        .split(",")
        .map((ingredient) => ingredient.trim());

      dishes = await knex("ingredients")
        .select(["dishes.id", "dishes.name", "dishes.user_id"])
        .where("dishes.user_id", user_id)
        .whereLike("dishes.name", `%${name}%`)
        .whereIn("ingredient_name", filterIngredients)
        .innerJoin("dishes", "dishes.id", "ingredients.dishe_id")
        .orderBy("dishes.name");
    } else {
      dishes = await knex("dishes")
        .where({ user_id })
        .whereLike("name", `%${name}%`)
        .orderBy("name");
    }
    const userIngredients = await knex("ingredients").where({ user_id });

    const dishesWithIngredients = dishes.map((dish) => {
      const dishIngredients = userIngredients.filter(
        (ingredient) => ingredient.dishe_id === dish.id
      );

      return {
        ...dish,
        ingredients: dishIngredients,
      };
    });
    return response.json(dishesWithIngredients);
  }
}

module.exports = DishesController;
