# aor-apollo-client

A [custom REST client](https://marmelab.com/admin-on-rest/RestClients.html) for [AOR (Admin On Rest)](https://www.npmjs.com/package/admin-on-rest) using [Apollo client](https://www.apollographql.com/client).

The goal of this package is to write as few lines of code as possible to set up an Apollo client with AOR. You can do so by following certain conventions in your server's [GraphQL schema](docs/configuration.md#graphql-schema), but any of these conventions can also be overridden in favor of [full customization](docs/configuration.md#request-config).

## Installation

```sh
yarn add aor-apollo-client
```
or
```sh
npm install aor-apollo-client
```

## Configuration

See full docs on configuration [here](docs/configuration.md).

## Quick Start

Assuming your server's [GraphQL schema](docs/configuration.md#graphql-schema) is already set up, there are only three steps to implement the AOR Apollo client:

1. Create an Apollo client. By design, this step isn't done for you. That way you can create/configure the client any way you'd like. The quickest way is with [apollo-boost](https://www.npmjs.com/package/apollo-boost):

```js
import ApolloClient from 'apollo-boost';

// Pass your GraphQL endpoint to uri
export default new ApolloClient({ uri: 'http://localhost:4000/graphql' });
```

2. Create a [resource map](docs/configuration.md#resource-map). This is an object that maps your [AOR Resource](https://marmelab.com/admin-on-rest/Resource.html) names to configuration used by AOR Apollo client to send respective queries/mutations:

```js
export default {
  // AOR resource name
  posts: {
    // AOR request type
    GET_ONE: {
      // Fields returned from Apollo request
      fields: `
        _id
        title
        authorId
        content
      `,
    },
    GET_LIST: {
      fields: `
        data {
          _id
          title
          authorId
        }
        total
      `,
    },
  },
};
```

3. Lastly, build the AOR Apollo client and pass it to the [AOR Admin component](https://marmelab.com/admin-on-rest/Admin.html). 
The default builder function exported from the package expects a single object parameter with the following fields: `apolloClient`, [resourceMap](docs/configuration.md#resource-map), and [defaultResourceConfig](docs/configuration.md#defaultresourceconfig) (optional):

```jsx
import React from 'react';
import { Admin, Resource } from 'admin-on-rest';
import { PostCreate, PostEdit, PostList } from './posts'; // Your AOR CRUD components
import buildAorApolloClient from 'aor-apollo-client';
import apolloClient from './apolloClient';
import resourceMap from './resourceMap';

const aorApolloClient = buildAorApolloClient({
  apolloClient,
  resourceMap,
  defaultResourceConfig: {
    primaryKey: '_id',
    paginationInput: 'PaginationInput',
    sortInput: 'SortInput',
  },
});

const App = () => (
  <Admin restClient={aorApolloClient}>
    <Resource
      name="posts"
      create={PostCreate}
      edit={PostEdit}
      list={PostList}
    />
  </Admin>
);

export default App;
```

## Under the Hood

There are three main steps that the client does for each AOR request under the hood:

1. Formats AOR params into Apollo variables
2. Sends the Apollo request
3. Parses Apollo result as AOR response

Each of these steps can be [overridden for any request](docs/configuration.md#request-config) on any resource. If you follow the package's conventions in your GraphQL schema, however, the AOR Apollo client can handle most of the work for you.
