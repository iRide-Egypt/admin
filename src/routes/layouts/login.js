import React, { Component, Fragment } from "react";
import IntlMessages from "Util/IntlMessages";
import { Row, Card, CardTitle, Form, Label, Input, Button } from "reactstrap";
import { NavLink } from "react-router-dom";

import { Colxx } from "Components/CustomBootstrap";

import { connect } from "react-redux";
import { loginUser } from "Redux/actions";

class LoginLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
    };
  }
  onUserLogin() {
    if (this.state.email !== "" && this.state.password !== "") {
      this.props.loginUser(this.state, this.props.history);
    }
  }
  handleEnter(e) {
    if (e.key === "Enter") {
      if (this.state.email !== "" && this.state.password !== "") {
        this.props.loginUser(this.state, this.props.history);
      }
    }
  }
  handleSubmit(e) {
    e.preventDefault();
    this.onUserLogin();
  }
  componentDidMount() {
    document.body.classList.add("background");
  }
  componentWillUnmount() {
    document.body.classList.remove("background");
  }
  render() {
    return (
      <Fragment>
        <div className="fixed-background" />
        <main>
          <div className="container">
            <Row className="h-100">
              <Colxx xxs="12" md="10" className="mx-auto my-auto">
                <Card className="auth-card">
                  <div className="position-relative image-side ">
                    {/* <p className="text-white h2">iRide Admin Tool</p>
                    <p className="white mb-0">
                      Please use your credentials to login.
                      
                    </p> */}
                  </div>
                  <div className="form-side">
                    <NavLink to={`/`} className="white">
                      <span className="logo-single" />
                    </NavLink>
                    <CardTitle className="mb-4">
                      <IntlMessages id="user.login-title" />
                    </CardTitle>
                    <Form onSubmit={() => console.log("Submitted")}>
                      <Label className="form-group has-float-label mb-4">
                        <Input
                          type="email"
                          onKeyDown={(e) => this.handleEnter(e)}
                          onChange={(e) =>
                            this.setState({ email: e.target.value })
                          }
                          defaultValue={this.state.email}
                        />
                        <IntlMessages id="user.email" />
                      </Label>
                      <Label className="form-group has-float-label mb-4">
                        <Input
                          onKeyDown={(e) => this.handleEnter(e)}
                          onChange={(e) =>
                            this.setState({ password: e.target.value })
                          }
                          type="password"
                        />
                        <IntlMessages
                          id="user.password"
                          defaultValue={this.state.password}
                        />
                      </Label>
                      <div className="d-flex justify-content-between align-items-center">
                        <NavLink to={`/forgot-password`}>
                          <IntlMessages id="user.forgot-password-question" />
                        </NavLink>
                        <Button
                          color="primary"
                          outline="light"
                          className="btn-shadow"
                          size="lg"
                          onClick={() => this.onUserLogin()}
                        >
                          <IntlMessages id="user.login-button" />
                        </Button>
                      </div>
                    </Form>
                  </div>
                </Card>
              </Colxx>
            </Row>
          </div>
        </main>
      </Fragment>
    );
  }
}
const mapStateToProps = ({ authUser }) => {
  const { user, loading } = authUser;
  return { user, loading };
};

export default connect(mapStateToProps, {
  loginUser,
})(LoginLayout);
