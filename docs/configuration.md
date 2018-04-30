# Configuration Guide

If you follow the conventions of this package, it can do a lot of heavy lifting for you with minimal configuration. It expects certain GraphQL mutations, queries, and types from your schema that are outlined below.

## GraphQL Schema

For consistency, this package follows the same AOR conventions for [request format and response format](https://marmelab.com/admin-on-rest/RestClients.html) with a few exceptions. This means we need to define matching queries/mutations on our GraphQL schema, as well some necessary data types.

### Queries/Mutations

The best way to demonstrate is by example. Let's say we have a resource called `posts`. The AOR Apollo client would expect the following queries/mutations:

AOR Request Type(s)|GraphQL Query/Mutation
---|---
`CREATE`|`createPost(data: PostInput!, previousData: PostInput!): Post!`
`UPDATE`|`updatePost(id: ID!, data: PostInput!, previousData: PostInput!): Post!`
`DELETE`|`deletePost(id: ID!, previousData: PostInput!): Post!`
`GET_ONE`|`post(id: ID!): Post!`
`GET_LIST`, `GET_MANY`, `GET_MANY_REFERENCE`|`posts(pagination: PaginationInput, sort: SortInput, filter: PostFilter, ids: [ID!]): PostPagination!`

**Important Notes:**
* `CREATE`, `UPDATE`, `DELETE` and `GET_ONE` do not return a response wrapped with a `data` field (like AOR specifies). They just return the resource data directly.
* `GET_LIST`, `GET_MANY`, and `GET_MANY_REFERENCE` all point to the same query. Only the required arguments for each request type will be included in the Apollo query.
* For `GET_MANY_REFERENCE` requests, [target](https://marmelab.com/admin-on-rest/RestClients.html) is included as a `filter` instead. For instance:
  ```
  { target: 'postId', id: '12345' } => { filter: { postId: '12345' } }
  ```

### Type Definitions

First, we need an object type to represent our resource as a single object of data. All that's required of this type is an `ID!` field. AOR expects `id`, but you could also use `_id` or any other primary key (see [Resource Config](#resource-config)):

```graphql
# No naming convention
type Post {
  id: ID!
  # Below fields are arbitrary
  authorId: ID!
  title: String!
  content: String!
}
```

For mutations, we need an input type. By default, AOR Apollo client assumes you use the same input type for `CREATE`, `UPDATE`, and `DELETE` requests (you can override this in [Request Config](#request-config)):

```graphql
# The capitalized, singular case of the resource name is appended with "Input"
input PostInput {
  # These fields are arbitrary
  authorId: ID!
  title: String!
  content: String!
}
```

For `GET_LIST` and `GET_MANY_REFERENCE` requests, we need an object type that returns an array of `data`, as well as a `total` field that's used for pagination:

```graphql
# No naming convention
type PostPagination {
  # These fields are required
  data: [Post!]!
  total: Int!
}
```

To support `pagination`, `sort`, and `filter` arguments for `GET_LIST` and `GET_MANY_REFERENCE` requests, we need to make respective `input` types. Note that these arguments are not passed into the Apollo query until you configure their names in your [Resource Config](#resource-config). While the naming of each input type is inconsequential, the fields for `pagination` and `sort` should match their [AOR counterparts](https://marmelab.com/admin-on-rest/RestClients.html):

```graphql
input PaginationInput {
  # These fields are required
  page: Int!
  perPage: Int!
}

input SortInput {
  # These fields are required
  field: String!
  order: String! # Could also be an enum (ASC, DESC)
}

input PostFilter {
  # These fields are arbitrary
  authorId: ID
}
```

## Resource Map

Once your GraphQL schema is set up, you can configure your `resourceMap` for the AOR Apollo client. This is an object that maps your [AOR Resource](https://marmelab.com/admin-on-rest/Resource.html) names to [Resource Config](#resource-config) objects. For instance:

```js
import buildAorApolloClient from 'aor-apollo-client';
import apolloClient from './apolloClient';

const resourceMap = {
  posts: {
    primaryKey: '_id',
    filterInput: 'PostFilterInput',
    GET_ONE: {
      fields: `
        _id
        authorId
        title
        content
      `,
    },
    GET_LIST: {
      fields: `
        data {
          _id
          authorId
          title
          createdAt
          updatedAt
        }
        total
      `,
    },
    GET_MANY_REFERENCE: {
      fields: `
        data {
          _id
          title
        }
        total
      `,
    },
    UPDATE: {
      exclude: ['createdAt', 'updatedAt'],
    },
  },
  authors: {
    // Resource config...
  },
};

const aorApolloClient = buildAorApolloClient({
  apolloClient,
  resourceMap,
});
```

### Resource Config

Use to configure options for each AOR resource.

Field|Data Type|Description
---|---|---
`resourceName`|`string`|The name of your resource, which is used to build the names of your queries, mutations, and data inputs. Defaults to what you've specified for AOR in your resource map.
`primaryKey`|`string`|The resource's unique identifier field name (defaults to `id`).
`dataInput`|`string`|GraphQL input type for `data`/`previousData` used for `CREATE`, `UPDATE`, and `DELETE` requests. Defaults to the capitalized, singular case of your `resourceName` appended with `Input`.
`paginationInput`|`string`|GraphQL input type for `pagination`. If not provided, `pagination` will not be passed into the Apollo query arguments for `GET_LIST` and `GET_MANY_REFERENCE`.
`sortInput`|`string`|GraphQL input type for `sort`. If not provided, `sort` will not be passed into the Apollo query arguments for `GET_LIST` and `GET_MANY_REFERENCE`.
`filterInput`|`string`|GraphQL input type for `filter`. If not provided, `filter` will not be passed into the Apollo query arguments for `GET_LIST` and `GET_MANY_REFERENCE`.
`[AOR Request Type]`|[Request Config](#request-config)|Map each AOR request type (`CREATE`, `GET_ONE`, etc.) to [Request Config](#request-config) objects.

**Important Notes:**
* In the [FAQ](https://marmelab.com/admin-on-rest/FAQ.html), AOR specifies that all resources must have an `id` field. If your data uses a different `primaryKey` (such as `_id` for Mongo DB), the AOR Apollo client will automatically map these values to `id` for each data object. Note that changing the `primaryKey` will also change the signature of your queries/mutations (e.g., `post(_id: ID!): Post!`).

#### defaultResourceConfig

There is an optional field for `buildAorApolloClient` that is useful for setting default configuration for all resources. For instance:

```js
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
    filterInput: 'FilterInput',
  },
});
```

Configuring these fields for an individual resource will override the default configuration.

### Request Config

Use to configure options or completely override functionality for each AOR request type (`CREATE`, `GET_ONE`, etc.) within a [Resource Config](#resource-config) object.

Field|Data Type|Description
---|---|---
`fields`|`string`|Specifies which GraphQL fields should be returned from the request.
`formatApolloVariables`|`function (variables: any) : any`|Callback that can be used to override formatting of Apollo variables.
`sendApolloRequest`|`function (variables: any) : ApolloQueryResult<any>`|Callback that can be used to override sending Apollo request.
`parseApolloResult`|`function (result: ApolloQueryResult<any>) : any`|Callback that can be used to override parsing Apollo result.

**Important Notes:**
* If `fields` are not specified for `CREATE`, `UPDATE`, or `DELETE` requests, `GET_ONE.fields` will be used as a fallback.
* If `fields` are not specified for `GET_MANY` or `GET_MANY_REFERENCE`, `GET_LIST.fields` will be used as a fallback.

#### Mutation Config

Use to configure options for a mutation request (`CREATE`, `UPDATE`, `DELETE`):

Field|Data Type|Description
---|---|---
`dataInput`|`string`|GraphQL input type for `data`/`previousData`. Changing this value per request would allow you to use `PostCreateInput`, `PostUpdateInput`, and `PostDeleteInput` instead of just `PostInput`.
`exclude`|`string[]`|Names of fields to be excluded from the Apollo variables. This is useful when AOR's cache includes unwanted fields from your list view, or if you're displaying relational data on the edit page and only need to submit an ID in the input.
`include`|`string[]`|The opposite of `exclude`. This is useful if an edit page has many readonly fields and you only want to include a few editable fields.
`mutation`|`string \| DocumentNode`|Overrides entire `mutation` parameter used in Apollo mutation. If string is provided, AOR Apollo client will parse into standard GraphQL AST for you using [graphql-tag](https://www.npmjs.com/package/graphql-tag).
`mutationName`|`string`|Overrides only the mutation name when AOR Apollo client builds the mutation.
`mutationOptions`|`MutationOptions`|Allows you to provide [additional options](https://www.apollographql.com/docs/react/essentials/mutations.html#props) to Apollo mutation.

**Important Notes:**
* If both `exclude` and `include` are configured for a request, `exclude` will take priority.

#### Query Config

Use to configure options for a query request (`GET_ONE`, `GET_LIST`, `GET_MANY`, `GET_MANY_REFERENCE`):

Field|Data Type|Description
---|---|---
`query`|`string \| DocumentNode`|Overrides entire `query` parameter used in Apollo query. If string is provided, AOR Apollo client will parse into standard GraphQL AST for you using [graphql-tag](https://www.npmjs.com/package/graphql-tag).
`queryName`|`string`|Overrides only the query name when AOR Apollo client builds the query.
`queryOptions`|`WatchQueryOptions`|Allows you to provide [additional options](https://www.apollographql.com/docs/react/essentials/queries.html#props) to Apollo query.
