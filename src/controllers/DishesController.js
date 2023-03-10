const knex = require("../database/knex");
const sqliteConnection = require("../database/sqlite");
const AppError = require("../utils/AppError");
const DiskStorage = require("../providers/DiskStorage");

class DishesController {
  async create(request, response) {
    const { name, category, description, price, ingredients } = request.body;
    const user_id = request.user.id;

    const dishFilename = request.file.filename;
    const diskStorage = new DiskStorage();
    const filename = await diskStorage.saveFile(dishFilename);

    const dish_id = await knex("dishes").insert({
      picture: filename,
      name,
      category,
      description,
      price,
      user_id,
    });

    const ingredientsInsert = ingredients.map((ingredient) => {
      return {
        ingredient_name: ingredient,
        dish_id,
        user_id,
      };
    });

    await knex("ingredients").insert(ingredientsInsert);

    return response.json(201);
  }
  async delete(request, response) {
    const { id } = request.params;

    await knex.raw("PRAGMA foreign_keys = ON");
    await knex("dishes").where({ id }).delete();

    return response.json();
  }
  async update(request, response) {
    const { name, category, description, price, ingredients } = request.body;
    const dish_id = request.user.id;
    const database = await sqliteConnection();
    const { id } = request.params;

    const dish = await database.get("SELECT * FROM dishes WHERE id = (?)", [
      dish_id,
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
      [dish.name, dish.category, dish.description, dish.price, dish_id]
    );

    let ingredientsInsert;

    ingredientsInsert = ingredients.map((ingredient_name, id) => {
      return {
        id,
        dish_id,
        user_id: dish_id,
        ingredient_name,
      };
    });
    await knex("ingredients").where({ dish_id }).delete();
    await knex("ingredients").where({ dish_id }).insert(ingredientsInsert);

    return response.status(200).json();
  }

  async show(request, response) {
    const { id } = request.params;

    const dish = await knex("dishes").where({ id }).first();
    const ingredients = await knex("ingredients")
      .where({ dish_id: id })
      .orderBy("name");

    response.json({
      ...dish,
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
        .innerJoin("dishes", "dishes.id", "ingredients.dish_id")
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
        (ingredient) => ingredient.dish_id === dish.id
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
