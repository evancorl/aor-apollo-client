import { ApolloError } from 'apollo-client';

function handleApolloError(error: ApolloError) {
  const { graphQLErrors, networkError } = error;

  if (graphQLErrors) {
    graphQLErrors.forEach((graphQLError) => {
      throw graphQLError;
    });
  }

  if (networkError) {
    throw networkError;
  }

  if (!graphQLErrors && !networkError) {
    throw error;
  }
}

export default handleApolloError;
