import omit from 'lodash.omit';
import pick from 'lodash.pick';
import {
  MutationConfig,
  RequestConfig,
  RequestType,
  ResourceConfig,
} from '../typings';

function filterApolloVariables(
  apolloVariables,
  requestType: RequestType,
  resourceConfig: ResourceConfig,
  requestConfig: RequestConfig,
) {
  let variables = apolloVariables;

  switch (requestType) {
    case RequestType.CREATE:
    case RequestType.UPDATE:
    case RequestType.DELETE: {
      const { data, previousData } = variables;

      // Exclude OR include fields to be submitted to the query/mutation
      const { exclude = [], include = [] } = <MutationConfig>requestConfig;

      if (exclude.length) {
        // Exclude fields such as relational data objects (only relational IDs should be submitted)
        variables = {
          ...variables,
          data: omit(data, exclude),
          previousData: previousData ? omit(previousData, exclude) : undefined,
        };
      } else if (include.length) {
        // Some CRUD forms have many readonly fields. We only want to submit the editable fields
        variables = {
          ...variables,
          data: pick(data, include),
          previousData: previousData ? pick(previousData, include) : undefined,
        };
      }
    }
    case RequestType.UPDATE:
    case RequestType.DELETE: {
      const { data, previousData } = variables;

      // Remove both primary keys from data and previousData
      variables = {
        ...variables,
        data: omit(data, ['id', resourceConfig.primaryKey]),
        previousData: omit(previousData, ['id', resourceConfig.primaryKey]),
      };
      break;
    }
    default:
      break;
  }

  return variables;
}

export default filterApolloVariables;
