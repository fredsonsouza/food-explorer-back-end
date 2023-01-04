const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");
const sqliteConnection = require("../database/sqlite");

class UsersController {
  async create(request, response) {
    const { name, email, password, isAdmin } = request.body;

    const database = await sqliteConnection();

    const checkUserExists = await database.get(
      "SELECT * FROM users WHERE email = (?)",
      [email]
    );

    if (checkUserExists) {
      throw new AppError("E-mail já cadastrado");
    }

    const hashedPassword = await hash(password, 8);

    await database.run(
      "INSERT INTO users (name, email, password) VALUES(?,?,?)",
      [name, email, hashedPassword]
    );

    return response.status(201).json();
  }

  async update(request, response) {
    const { name, email, password, old_password, isAdmin } = request.body;
    const { id } = request.params;
    const database = await sqliteConnection();
    const user = await database.get("SELECT * FROM users WHERE id = (?)", [id]);

    if (!user) {
      throw new AppError("Usuário não encontrado!");
    }
    const userWithUpdatedEmail = await database.get(
      "SELECT * FROM users WHERE email =(?)",
      [email]
    );

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError("Este e-mail ja está em uso");
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.isAdmin = isAdmin ?? user.isAdmin;

    if (password && !old_password) {
      throw new AppError(
        "Informe a senha antiga para poder definir sua nova senha!"
      );
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password);

      if (!checkOldPassword) {
        throw new AppError("Senha antiga não confere!");
      }
      user.password = await hash(password, 8);
    }

    await database.run(
      `
    UPDATE users SET
    name = ?,
    email = ?,
    password = ?,
    isAdmin = ?
    WHERE id = ?`,
      [user.name, user.email, user.password, user.isAdmin, id]
    );

    return response.status(200).json();
  }
}

module.exports = UsersController;
