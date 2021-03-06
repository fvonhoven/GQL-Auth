import React from "react"
import { Container, Button, Content, Form, Item, Input, Text } from "native-base"
import { graphql } from "react-apollo"
import gql from "graphql-tag"

class Login extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      email: __DEV__ ? "frank@infinite.red" : "",
      emailError: false,
      password: __DEV__ ? "password" : "",
      passwordError: false
    }
  }

  handleInputChange = (field, value) => {
    const newState = {
      ...this.state,
      [field]: value
    }
    this.setState(newState)
  }

  handleSubmit = () => {
    const { email, password } = this.state
    if (email.length === 0) {
      return this.setState({ emailError: true })
    }
    this.setState({ emailError: false })

    if (password.length === 0) {
      return this.setState({ passwordError: true })
    }
    this.setState({ passwordError: false })

    this.props
      .login(email, password)
      .then(({ data }) => {
        return this.props.screenProps.changeLoginState(true, data.login.jwt)
      })
      .catch(e => {
        if (e.message.includes("email")) {
          this.setState({ emailError: true })
        }
        if (e.message.includes("password")) {
          this.setState({ passwordError: true })
        }
      })
  }

  render() {
    const { emailError, passwordError } = this.state
    const { navigation } = this.props
    return (
      <Container>
        <Content>
          <Form>
            <Item error={emailError}>
              <Input
                placeholder="Email"
                onChangeText={value => this.handleInputChange("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={__DEV__ && "frank@infinite.red"}
              />
            </Item>
            <Item error={passwordError}>
              <Input
                placeholder="Password"
                onChangeText={value => this.handleInputChange("password", value)}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                value={__DEV__ && "password"}
              />
            </Item>
          </Form>
          <Button full onPress={this.handleSubmit}>
            <Text>Sign In</Text>
          </Button>
          <Button full transparent onPress={() => navigation.navigate("Register")}>
            <Text>Sign Up</Text>
          </Button>
        </Content>
      </Container>
    )
  }
}

export default graphql(
  gql`
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        _id
        email
        jwt
      }
    }
  `,
  {
    props: ({ mutate }) => ({
      login: (email, password) => mutate({ variables: { email, password } })
    })
  }
)(Login)
