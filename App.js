import React, { Component } from "react"
import { StackNavigator } from "react-navigation" // 1.0.0-beta.19
import { ApolloClient } from "apollo-client"
import { InMemoryCache } from "apollo-cache-inmemory"
import { HttpLink } from "apollo-link-http"
import { ApolloLink } from "apollo-link"
import { ApolloProvider } from "react-apollo"
import { withClientState } from "apollo-link-state"
import { setContext } from "apollo-link-context"
import { signIn, signOut, getToken } from "./util"

import Register from "./Register"
import Login from "./Login"
import Profile from "./Profile"

const AuthStack = StackNavigator({
  Login: { screen: Login, navigationOptions: { headerTitle: "Login" } },
  Register: { screen: Register, navigationOptions: { headerTitle: "Register" } }
})

const cache = new InMemoryCache()
const stateLink = withClientState({ cache })
const httpLink = new HttpLink({ uri: "https://494l130kz9.lp.gql.zone/graphql" })
const authLink = setContext(async (req, { headers }) => {
  const token = await getToken()
  return {
    ...headers,
    headers: {
      authorization: token ? `Bearer ${token}` : null
    }
  }
})
const link = authLink.concat(httpLink)
const client = new ApolloClient({
  cache,
  link: ApolloLink.from([stateLink, link])
})

const LoggedInStack = StackNavigator({
  Profile: { screen: Profile, navigationOptions: { headerTitle: "Profile" } }
})

export default class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loggedIn: false
    }
  }

  handleChangeLoginState = (loggedIn = false, jwt) => {
    this.setState({ loggedIn })
    if (loggedIn) {
      signIn(jwt)
    } else {
      signOut()
    }
  }

  render() {
    return (
      <ApolloProvider client={client}>
        {this.state.loggedIn ? (
          <LoggedInStack screenProps={{ changeLoginState: this.handleChangeLoginState }} />
        ) : (
          <AuthStack screenProps={{ changeLoginState: this.handleChangeLoginState }} />
        )}
      </ApolloProvider>
    )
  }
}
