import omit from 'lodash.omit';
import pick from 'lodash.pick';
import {
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
    case RequestType.UPDATE:
    case RequestType.DELETE: {
      // Exclude OR include fields to be submitted to the query/mutation
      const { exclude = [], include = [] } = requestConfig;

      if (exclude.length) {
        // Exclude fields such as relational data objects (only relational IDs should be submitted)
        variables = {
          ...variables,
          data: omit(variables.data, exclude),
          previousData: omit(variables.previousData, exclude),
        };
      } else if (include.length) {
        // Some CRUD forms have many readonly fields. We only want to submit the editable fields
        variables = {
          ...variables,
          data: pick(variables.data, include),
          previousData: pick(variables.previousData, include),
        };
      }

      // Remove both primary keys from data and previousData
      variables = {
        ...variables,
        data: omit(variables.data, ['id', resourceConfig.primaryKey]),
        previousData: omit(variables.previousData, ['id', resourceConfig.primaryKey]),
      };
      break;
    }
    default:
      break;
  }

  return variables;
}

export default filterApolloVariables;
