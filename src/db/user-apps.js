import * as R from 'ramda';
import { whenNotNil } from '../util/fp';
import { evolveModel } from '../util/model';

const toUserApp = {
  id: R.prop('id'),
  name: R.prop('name'),
  description: R.prop('description'),
  userId: R.prop('user_id'),
  key: R.prop('key'),
};

const loadByKey = (db) => (key) =>
  db('user_apps')
    .where('key', key)
    .first()
    .then(whenNotNil(evolveModel(toUserApp)));

export const userAppsRepository = (db) => ({
  loadByKey: loadByKey(db),
});
