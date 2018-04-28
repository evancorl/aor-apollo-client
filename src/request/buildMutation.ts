import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';
import { singularPascalCase } from '../config/casing';
import { MutationConfig, RequestType, ResourceConfig } from '../typings';

function buildMutation(
  requestType: RequestType,
  resourceConfig: ResourceConfig,
  requestConfig: MutationConfig,
) : DocumentNode {
  const { mutation } = requestConfig;

  // Override mutation builder with custom mutation
  if (mutation) {
    return typeof mutation === 'object'
      ? mutation
      : gql(mutation);
  }

  const { primaryKey: id, resourceName } = resourceConfig;
  const { fields, getMutationName } = requestConfig;
  const { fields: getOneFields } = resourceConfig.GET_ONE;

  const mutationName = requestConfig.mutationName || getMutationName(resourceName);
  const dataInput = requestConfig.dataInput ||
                    resourceConfig.dataInput ||
                    `${singularPascalCase(resourceName)}Input`;

  let mutationString;

  switch (requestType) {
    case RequestType.CREATE: {
      mutationString = `
        mutation ${mutationName}($data: ${dataInput}!) {
          ${mutationName}(data: $data) {
            ${fields || getOneFields}
          }
        }
      `;
      break;
    }
    case RequestType.UPDATE: {
      mutationString = `
        mutation ${mutationName}($id: ID!, $data: ${dataInput}!, $previousData: ${dataInput}!) {
          ${mutationName}(${id}: $id, data: $data, previousData: $previousData) {
            ${fields || getOneFields}
          }
        }
      `;
      break;
    }
    case RequestType.DELETE: {
      mutationString = `
        mutation ${mutationName}($id: ID!, $previousData: ${dataInput}!) {
          ${mutationName}(${id}: $id, previousData: $previousData) {
            ${fields || getOneFields}
          }
        }
      `;
      break;
    }
    default:
      break;
  }

  return gql(mutationString);
}

export default buildMutation;
