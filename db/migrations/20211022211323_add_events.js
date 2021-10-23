
exports.up = (knex) => knex.schema

  .createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('display_name').notNullable();
  })

  .createTable('event_types', (table) => {
    table.uuid('owner_id').notNullable();
    table.string('name', 20).notNullable();
    table.string('display_name').notNullable();
    table.text('description');
    table.boolean('accepts_rating').defaultTo(false);

    table.foreign('owner_id').references('users.id');
    table.primary(['owner_id', 'name'])
  })

  .createTable('events', (table) => {
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('owner_id').notNullable();
    table.string('event_type', 20).notNullable();
    table.integer('rating');

    table.foreign(['owner_id', 'event_type']).references(['owner_id', 'name']).on('event_types');
  });
  
exports.down = (knex) => knex.schema
  .dropTableIfExists('events')
  .dropTableIfExists('event_types')
  .dropTableIfExists('users');

