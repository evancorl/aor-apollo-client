import mergeResourceConfig from './config/mergeResourceConfig';
import formatApolloVariables from './params/formatApolloVariables';
import sendApolloRequest from './request/sendApolloRequest';
import parseApolloResult from './response/parseApolloResult';
import {
  AorApolloClient,
  AorApolloClientOptions,
  RequestType,
  RestParams,
  RestResponse,
} from './typings';

function buildAorApolloClient(options: AorApolloClientOptions) : AorApolloClient {
  return async function aorApolloClient(
    requestType : RequestType,
    resourceName : string,
    restParams : RestParams,
  ) : Promise<RestResponse> {
    let restResponse;

    try {
      const resourceConfig = mergeResourceConfig(options, resourceName);
      const requestConfig = resourceConfig[requestType];

      const apolloVariables = formatApolloVariables(
        restParams,
        requestType,
        resourceConfig,
        requestConfig,
      );

      const apolloResult = await sendApolloRequest(
        options.apolloClient,
        apolloVariables,
        requestType,
        resourceConfig,
        requestConfig,
      );

      restResponse = parseApolloResult(
        apolloResult,
        requestType,
        resourceConfig,
        requestConfig,
      );
    } catch (error) {
      throw error;
    }

    return restResponse;
  };
}

export default buildAorApolloClient;
