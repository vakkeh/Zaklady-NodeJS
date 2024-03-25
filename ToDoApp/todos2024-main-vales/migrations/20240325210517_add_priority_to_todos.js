export const up = function(knex) {
    return knex.schema.table('todos', function(table) {
      table.enum('priority', ['normal', 'low', 'high']).defaultTo('normal');
    });
  };
  
  export const down = function(knex) {
    return knex.schema.table('todos', function(table) {
      table.dropColumn('priority');
    });
  };