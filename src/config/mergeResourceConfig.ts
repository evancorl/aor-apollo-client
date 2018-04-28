import defaultsDeep from 'lodash.defaultsdeep';
import defaultResourceConfig from './defaultResourceConfig';
import { AorApolloClientOptions, ResourceConfig } from '../typings';

// TODO: throw errors for missing configuration
function mergeResourceConfig(
  options: AorApolloClientOptions,
  resourceName: string,
) : ResourceConfig {
  const {
    resourceMap,
    defaultResourceConfig: providedDefaultResourceConfig,
  } = options;

  const resourceConfig = defaultsDeep(
    {}, // The object to mutate
    resourceMap[resourceName], // First priority is given to the provided resource map
    providedDefaultResourceConfig || {},
    defaultResourceConfig,
    <ResourceConfig>{
      // Attach the AOR resource name if not provided
      resourceName,
    },
  );

  return resourceConfig;
}

export default mergeResourceConfig;
