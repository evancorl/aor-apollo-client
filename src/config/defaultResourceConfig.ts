
import { ResourceConfig } from '../typings';
import {
  singularPascalCase,
  singularCamelCase,
  pluralCamelCase,
} from './casing';

const defaultResourceConfig = <ResourceConfig>{
  primaryKey: 'id',
  CREATE: {
    getMutationName: resourceName => (
      `create${singularPascalCase(resourceName)}`
    ),
  },
  UPDATE: {
    getMutationName: resourceName => (
      `update${singularPascalCase(resourceName)}`
    ),
  },
  DELETE: {
    getMutationName: resourceName => (
      `delete${singularPascalCase(resourceName)}`
    ),
  },
  GET_ONE: {
    getQueryName: singularCamelCase,
  },
  GET_LIST: {
    getQueryName: pluralCamelCase,
  },
  GET_MANY: {
    getQueryName: pluralCamelCase,
  },
  GET_MANY_REFERENCE: {
    getQueryName: pluralCamelCase,
  },
};

export default defaultResourceConfig;
