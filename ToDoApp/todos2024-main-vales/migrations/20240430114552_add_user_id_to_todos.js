export const up = function(knex) {
    return knex.schema.table('todos', function(table) {
      table.integer('user_id').unsigned();
      table.foreign('user_id').references('users.id');
    });
};
  
export const down = function(knex) {
    return knex.schema.table('todos', function(table) {
      table.dropColumn('user_id');
    });
};