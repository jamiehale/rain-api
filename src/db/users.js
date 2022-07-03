import * as R from 'ramda';
import { whenNotNil } from '../util/fp';
import { evolveModel } from '../util/model';

const toUser = {
  id: R.prop('id'),
  displayName: R.prop('display_name'),
};

const load = (db) => (id) =>
  db('users')
    .where('id', id)
    .first()
    .then(whenNotNil(evolveModel(toUser)));

export const usersRepository = (db) => ({
  load: load(db),
});
