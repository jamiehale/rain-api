
const reset = (knex) => Promise.resolve()
  .then(() => knex('events').del())
  .then(() => knex('event_types').del())
  .then(() => knex('users').del());

const jamie = {
  id: 'b722f8c9-cd86-494f-96a1-cf1c3467accb',
  display_name: 'jamie',
};

exports.seed = (knex) => reset(knex)
  .then(() => knex('users').insert([
    jamie,
  ]))
  .then(() => knex('event_types').insert([
    {
      owner_id: jamie.id,
      name: 'advil',
      display_name: 'Advil (200mg)',
    },
  ]));

