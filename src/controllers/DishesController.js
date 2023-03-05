const knex = require("../database/knex");
const sqliteConnection = require("../database/sqlite");
const AppError = require("../utils/AppError");

class DishesController {
  async create(request, response) {
    const { name, category, description, price, ingredients } = request.body;
    const user_id = request.user.id;

    const dishe_id = await knex("dishes").insert({
      name,
      category,
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
  async delete(request, response) {
    const { id } = request.params;

    await knex.raw("PRAGMA foreign_keys = ON");
    await knex("dishes").where({ id }).delete();

    return response.json();
  }
  async update(request, response) {
    const { name, category, description, price, ingredients } = request.body;
    const dishe_id = request.user.id;
    const database = await sqliteConnection();
    const { id } = request.params;

    const dish = await database.get("SELECT * FROM dishes WHERE id = (?)", [
      dishe_id,
    ]);

    if (!dish) {
      throw new AppError("Prato não encontrado!");
    }
    const disheWithUpdatedName = await database.get(
      "SELECT * FROM dishes WHERE name =(?)",
      [name]
    );

    if (disheWithUpdatedName && disheWithUpdatedName.id !== dish.id) {
      throw new AppError("O nome para este prato já está em uso!");
    }

    dish.name = name ?? dish.name;
    dish.category = category ?? dish.category;
    dish.description = description ?? dish.description;
    dish.price = price ?? dish.price;

    await database.run(
      `
    UPDATE dishes SET
    name = ?,
    category = ?,
    description = ?,
    price = ?
    WHERE id = ?`,
      [dish.name, dish.category, dish.description, dish.price, dishe_id]
    );

    let ingredientsInsert;

    ingredientsInsert = ingredients.map((ingredient_name, id) => {
      return {
        id,
        dishe_id,
        user_id: dishe_id,
        ingredient_name,
      };
    });
    await knex("ingredients").where({ dishe_id }).delete();
    await knex("ingredients").where({ dishe_id }).insert(ingredientsInsert);

    return response.status(200).json();
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

  async index(request, response) {
    const { name, ingredients } = request.query;
    const user_id = request.user.id;

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

    const dishesWithIngredients = dishes.map((dishe) => {
      const dishIngredients = userIngredients.filter(
        (ingredient) => ingredient.dishe_id === dishe.id
      );

      return {
        ...dishe,
        ingredients: dishIngredients,
      };
    });
    return response.json(dishesWithIngredients);
  }
}

module.exports = DishesController;
