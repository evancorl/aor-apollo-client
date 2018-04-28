import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';
import { plural } from 'pluralize';
import buildPaginatedQueryVariables from './buildPaginatedQueryVariables';
import buildPaginatedQueryArgs from './buildPaginatedQueryArgs';
import {
  QueryConfig,
  ResourceConfig,
  RequestType,
} from '../typings';

function buildQuery(
  requestType: RequestType,
  resourceConfig: ResourceConfig,
  requestConfig: QueryConfig,
) : DocumentNode {
  const { query } = requestConfig;

  // Override query builder with custom query
  if (query) {
    return typeof query === 'object'
      ? query
      : gql(query);
  }

  const { primaryKey: id, resourceName } = resourceConfig;
  const { fields, getQueryName } = requestConfig;
  const { fields: getListFields } = resourceConfig.GET_LIST;

  const queryName = requestConfig.queryName || getQueryName(resourceName);

  let queryString;

  switch (requestType) {
    case RequestType.GET_ONE: {
      queryString = `
        query ${queryName}($id: ID!) {
          ${queryName}(${id}: $id) {
            ${fields}
          }
        }
      `;
      break;
    }
    case RequestType.GET_LIST: {

      queryString = `
        query ${queryName}${buildPaginatedQueryVariables(resourceConfig)} {
          ${queryName}${buildPaginatedQueryArgs(resourceConfig)} {
            ${getListFields}
          }
        }
      `;
      break;
    }
    case RequestType.GET_MANY: {
      queryString = `
        query ${queryName}($ids: [ID!]) {
          ${queryName}(${plural(id)}: $ids) {
            ${fields || getListFields}
          }
        }
      `;
      break;
    }
    case RequestType.GET_MANY_REFERENCE: {
      queryString = `
        query ${queryName}${buildPaginatedQueryVariables(resourceConfig)} {
          ${queryName}${buildPaginatedQueryArgs(resourceConfig)} {
            ${fields || getListFields}
          }
        }
      `;
      break;
    }
    default:
      break;
  }

  return gql(queryString);
}

export default buildQuery;
