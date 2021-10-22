import knex from 'knex';

export default (host, user, password, database) => Promise.resolve(
  knex({
    client: 'pg',
    connection: {
      host,
      user,
      password,
      database,
    },
    pool: {
      min: 5,
      max: 30,
    },
  }),
);

