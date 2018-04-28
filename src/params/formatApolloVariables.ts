import cloneDeep from 'lodash.clonedeep';
import { plural } from 'pluralize';
import filterApolloVariables from './filterApolloVariables';
import removeApolloTypename from './removeApolloTypename';
import {
  GetListParams,
  GetManyParams,
  GetManyReferenceParams,
  RequestConfig,
  RequestType,
  ResourceConfig,
  RestParams,
} from '../typings';

function formatApolloVariables(
  restParams : RestParams,
  requestType : RequestType,
  resourceConfig: ResourceConfig,
  requestConfig : RequestConfig,
) : object {
  // Ensure that the rest params are not mutated (can break the AOR cache):
  // https://github.com/marmelab/admin-on-rest/issues/5
  let variables = cloneDeep(<any>restParams);

  if (typeof requestConfig.formatApolloVariables === 'function') {
    return requestConfig.formatApolloVariables(variables);
  }

  variables = filterApolloVariables(variables, requestType, resourceConfig, requestConfig);

  const { primaryKey } = resourceConfig;

  switch (requestType) {
    case RequestType.UPDATE: {
      variables = removeApolloTypename(variables);
      variables = {
        ...variables,
      };
      break;
    }
    case RequestType.GET_LIST:
    case RequestType.GET_MANY_REFERENCE: {
      const { sort } = <GetListParams>variables;

      variables = <GetListParams>{
        ...variables,
        sort: {
          // Convert "id" to configured primary key
          field: sort.field === 'id' ? primaryKey : sort.field,
          order: sort.order,
        },
      };
    }
    case RequestType.GET_MANY_REFERENCE: {
      const { target, id } = <GetManyReferenceParams>variables;
      const targetFilter = target === 'id' ? primaryKey : target;

      variables.filter[targetFilter] = id;
      break;
    }
    case RequestType.GET_MANY: {
      const { ids } = <GetManyParams>variables;

      variables = {
        [plural(primaryKey)]: ids,
      };
      break;
    }
    default:
      break;
  }

  return variables;
}

export default formatApolloVariables;
