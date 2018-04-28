import { ResourceConfig } from '../typings';

function buildPaginatedQueryArgs(resourceConfig: ResourceConfig) : string {
  const {
    paginationInput,
    sortInput,
    filterInput,
  } = resourceConfig;

  if (!paginationInput && !sortInput && !filterInput) {
    return '';
  }

  return `(
    ${paginationInput ? `pagination: $pagination\n` : ''}
    ${sortInput ? `sort: $sort\n` : ''}
    ${filterInput ? `filter: $filter\n` : ''}
  )`;
}

export default buildPaginatedQueryArgs;
