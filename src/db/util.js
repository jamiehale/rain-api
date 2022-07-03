import * as R from 'ramda';
import { stripNilValues } from '../util/fp';
import { evolveModel } from '../util/model';

const orderedObjectDesc = (desc, evolution) => {
  const [column, order] = R.head(R.toPairs(stripNilValues(evolveModel(evolution, { [desc.column]: R.propOr('asc', 'order', desc) }))));
  return {
    column,
    order,
  };
};

const orderedArrayDesc = (desc, evolution) =>
  R.reduce(
    (acc, column) => {
      if (R.type(column) === 'String') {
        return [...acc, column];
      } else {
        return [...acc, orderedObjectDesc(column, evolution)];
      }
    },
    [],
    desc,
  );

const orderedStringDesc = (desc, evolution) => {
  const [column, order] = R.head(R.toPairs(stripNilValues(evolveModel(evolution, { [desc]: 'asc' }))));
  return {
    column,
    order,
  };
};

export const ordered = (desc, evolution, qb) => {
  if (desc) {
    if (R.type(desc) === 'Array') {
      return qb.orderBy(orderedArrayDesc(desc, evolution));
    } else if (R.type(desc) === 'Object') {
      return qb.orderBy([orderedObjectDesc(desc, evolution)]);
    } else {
      return qb.orderBy([orderedStringDesc(desc, evolution)]);
    }
  } else {
    return qb;
  }
};

export const filtered = (desc, evolution, qb) => {
  if (desc) {
    return qb.where(stripNilValues(evolveModel(evolution, desc)));
  }
  return qb;
};
