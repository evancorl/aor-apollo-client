import { ApolloQueryResult } from 'apollo-client';
import formatDataWithId from './formatDataWithId';
import getOperationName from './getOperationName';
import {
  RequestType,
  RequestConfig,
  ResourceConfig,
  RestResponse,
} from '../typings';

function parseApolloResult(
  result: ApolloQueryResult<any>,
  requestType: RequestType,
  resourceConfig: ResourceConfig,
  requestConfig: RequestConfig,
) : RestResponse {
  if (typeof requestConfig.parseApolloResult === 'function') {
    return requestConfig.parseApolloResult(result);
  }

  const operationName = getOperationName(requestType, resourceConfig, requestConfig);

  let data;
  let total;

  switch (requestType) {
    case RequestType.CREATE:
    case RequestType.UPDATE:
    case RequestType.DELETE:
    case RequestType.GET_ONE: {
      data = result.data[operationName];
      break;
    }
    case RequestType.GET_LIST:
    case RequestType.GET_MANY:
    case RequestType.GET_MANY_REFERENCE: {
      data = result.data[operationName].data;
      total = result.data[operationName].total;
      break;
    }
    default:
      break;
  }

  const parsedResult = <RestResponse>{
    data: formatDataWithId(data, resourceConfig),
  };

  if (total !== undefined) {
    (<any>parsedResult).total = total;
  }

  return parsedResult;
}

export default parseApolloResult;
