exports.up = (knex) =>
  knex.schema.createTable("dishes", (table) => {
    table.increments("id");
    table.text("name");
    table.text("category");
    table.text("description");
    table.decimal("price");
    table.text("picture");
    table.integer("user_id").references("id").inTable("users");
  });

exports.down = (knex) => knex.schema.dropTable("dishes");
