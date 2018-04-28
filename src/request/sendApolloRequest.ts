import { ApolloClient, ApolloQueryResult } from 'apollo-client';
import buildMutation from './buildMutation';
import buildQuery from './buildQuery';
import handleApolloError from './handleApolloError';
import {
  MutationConfig,
  QueryConfig,
  RequestType,
  ResourceConfig,
  RequestConfig,
} from '../typings';

async function sendApolloRequest(
  apolloClient: ApolloClient<any>,
  variables,
  requestType : RequestType,
  resourceConfig: ResourceConfig,
  requestConfig: RequestConfig,
) : Promise<ApolloQueryResult<any>> {
  let result;

  if (typeof requestConfig.sendApolloRequest === 'function') {
    return requestConfig.sendApolloRequest(variables);
  }

  try {
    switch (requestType) {
      case RequestType.CREATE:
      case RequestType.UPDATE:
      case RequestType.DELETE: {
        const mutation = buildMutation(
          requestType,
          resourceConfig,
          <MutationConfig>requestConfig,
        );

        result = await apolloClient.mutate({
          mutation,
          variables,
          ...(<MutationConfig>requestConfig).mutationOptions,
        });
        break;
      }
      case RequestType.GET_ONE:
      case RequestType.GET_LIST:
      case RequestType.GET_MANY:
      case RequestType.GET_MANY_REFERENCE: {
        const query = buildQuery(requestType, resourceConfig, <QueryConfig>requestConfig);

        result = await apolloClient.query({
          query,
          variables,
          fetchPolicy: 'network-only', // Disable cache
          ...(<QueryConfig>requestConfig).queryOptions,
        });
        break;
      }
      default:
        break;
    }
  } catch (error) {
    handleApolloError(error);
  }

  return result;
}

export default sendApolloRequest;
