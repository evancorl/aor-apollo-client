import { ResourceConfig } from '../typings';

function buildPaginatedQueryVariables(resourceConfig: ResourceConfig) : string {
  const {
    paginationInput,
    sortInput,
    filterInput,
  } = resourceConfig;

  if (!paginationInput && !sortInput && !filterInput) {
    return '';
  }

  return `(
    ${paginationInput ? `$pagination: ${paginationInput}\n` : ''}
    ${sortInput ? `$sort: ${sortInput}\n` : ''}
    ${filterInput ? `$filter: ${filterInput}\n` : ''}
  )`;
}

export default buildPaginatedQueryVariables;
