import {
  MutationConfig,
  QueryConfig,
  RequestType,
  RequestConfig,
  ResourceConfig,
} from '../typings';

function getOperationName(
  requestType: RequestType,
  resourceConfig: ResourceConfig,
  requestConfig: RequestConfig,
) : string {
  const { resourceName } = resourceConfig;

  let operationName;

  switch (requestType) {
    case RequestType.CREATE:
    case RequestType.UPDATE:
    case RequestType.DELETE: {
      const mutationConfig = <MutationConfig>requestConfig;

      operationName = mutationConfig.mutationName ||
                      mutationConfig.getMutationName(resourceName);

      break;
    }
    case RequestType.GET_ONE:
    case RequestType.GET_LIST:
    case RequestType.GET_MANY:
    case RequestType.GET_MANY_REFERENCE: {
      const queryConfig = <QueryConfig>requestConfig;

      operationName = queryConfig.queryName ||
                      queryConfig.getQueryName(resourceName);
      break;
    }
    default:
      break;
  }

  return operationName;
}

export default getOperationName;
