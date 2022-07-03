export const up = (knex) =>
  knex.schema

    .createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('display_name').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })

    .createTable('user_apps', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('name').notNullable();
      table.string('description');
      table.uuid('user_id').notNullable();
      table.string('key').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());

      table.foreign('user_id').references('users.id');
      table.unique('key');
      table.index('key');
    })

    .createTable('local_accounts', (table) => {
      table.string('username').primary();
      table.uuid('user_id').notNullable();
      table.string('salt').notNullable();
      table.string('salted_password').notNullable();
      table.string('status').notNullable().defaultTo('enabled');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());

      table.foreign('user_id').references('users.id');
    })

    .createTable('refresh_tokens', (table) => {
      table.string('token').primary();
      table.uuid('user_id').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('valid_before').notNullable();

      table.foreign('user_id').references('users.id');
      table.index('user_id');
    })

    .createTable('inbox_items', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('name').notNullable();
      table.string('description');
      table.uuid('user_id').notNullable();
      table.string('status').notNullable().defaultTo('pending');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());

      table.foreign('user_id').references('users.id');
    })

    .createTable('tasks', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('name').notNullable();
      table.string('description');
      table.date('due');
      table.uuid('parent_id');
      table.uuid('user_id').notNullable();
      table.boolean('done').notNullable().defaultTo(false);
      table.uuid('inbox_item_id');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());

      table.foreign('parent_id').references('tasks.id');
      table.foreign('user_id').references('users.id');
      table.foreign('inbox_item_id').references('inbox_items.id');
    })

    .createTable('notes', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('name').notNullable();
      table.string('body').notNullable();
      table.uuid('user_id').notNullable();
      table.uuid('inbox_item_id');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());

      table.foreign('user_id').references('users.id');
      table.foreign('inbox_item_id').references('inbox_items.id');
    });

export const down = (knex) =>
  knex.schema
    .dropTableIfExists('notes')
    .dropTableIfExists('tasks')
    .dropTableIfExists('inbox_items')
    .dropTableIfExists('refresh_tokens')
    .dropTableIfExists('local_accounts')
    .dropTableIfExists('user_apps')
    .dropTableIfExists('users');
