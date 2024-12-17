import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
  split,
  gql,
} from '@apollo/client'
import { setContext } from "@apollo/client/link/context"
import { getMainDefinition } from '@apollo/client/utilities'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("library-user-token")
  if (token) {
    return {
      headers: {
        ...headers,
        authorization: `Bearer ${token}`,
      },
    }
  }
  return { headers }
})

const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql",
})

const wsLink = new GraphQLWsLink(
  createClient({ url: 'ws://localhost:4000/graphql' })
)

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  authLink.concat(httpLink)
)

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink
})

const query = gql`
  query {
    allAuthors {
      name
      born
      bookCount
      id
    }
  }
`

client.query({ query })
  .then((response) => {
    console.log(response.data);
  })

console.log('Running index.js')

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
)
