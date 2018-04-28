import camelCase from 'lodash.camelcase';
import upperFirst from 'lodash.upperfirst';
import { plural, singular } from 'pluralize';

// Ex. machineParts => machinePart
export function singularCamelCase(resourceName: string) : string {
  return `${camelCase(singular(resourceName))}`;
}

// Ex. machineParts => MachinePart
export function singularPascalCase(resourceName: string) : string {
  return `${upperFirst(camelCase(singular(resourceName)))}`;
}

// Ex. machineParts => machineParts
export function pluralCamelCase(resourceName: string) : string {
  return `${camelCase(plural(resourceName))}`;
}
