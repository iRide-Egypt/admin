import React, { Component, Fragment } from "react";
import IntlMessages from "Util/IntlMessages";
import { injectIntl } from "react-intl";
import {
  Row,
  Card,
  CardBody,
  Nav,
  NavItem,
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
  TabContent,
  TabPane,
  Badge,
  Collapse,
  ButtonDropdown,
  CardSubtitle,
  CardTitle,
  CardImg,
  CardText,
  FormGroup,
  CustomInput,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "reactstrap";
import Select from "react-select";
import CustomSelectInput from "Components/CustomSelectInput";

import { Colxx, Separator } from "Components/CustomBootstrap";
import { BreadcrumbItems } from "Components/BreadcrumbContainer";
import { NavLink } from "react-router-dom";
import classnames from "classnames";
import ApplicationMenu from "Components/ApplicationMenu";

import PerfectScrollbar from "react-perfect-scrollbar";
import { connect } from "react-redux";
import {
  getPostList,
  getPostListWithFilter,
  getPostListWithOrder,
  getPostListSearch,
  addPostItem,
  selectedPostItemsChange,
} from "Redux/actions";
import firebase from "firebase";
import { db } from "../../firebase";

const docRef = db.collection("app").doc("postGenerator");
class PostGenerator extends Component {
  state = {
    postData: null,
    dropdownSplitOpen: false,
    modalOpen: false,
    lastChecked: null,

    title: "",
    label: {},
    category: {},
    status: "ACTIVE",
    displayOptionsIsOpen: false,
  };
  componentDidMount() {
    this.setPostsList();
  }

  componentWillUnmount() {
    if (this._asyncRequest) {
      this._asyncRequest.cancel();
    }
  }

  setPostsList = () => {
    this._asyncRequest = docRef.get().then((doc) => {
      console.log(doc.data().posts);

      this._asyncRequest = null;
      this.setState({ postData: doc.data().posts });
      console.log("Success: ", this.state);
    });
  };

  toggleDisplayOptions() {
    this.setState({ displayOptionsIsOpen: !this.state.displayOptionsIsOpen });
  }

  toggleModal() {
    this.setState({
      modalOpen: !this.state.modalOpen,
    });
  }

  toggleSplit() {
    this.setState((prevState) => ({
      dropdownSplitOpen: !prevState.dropdownSplitOpen,
    }));
  }

  addPost() {
    let item = "";
    docRef
      .update({
        todos: firebase.firestore.FieldValue.arrayUnion(item),
      })
      .then((e) => {})
      .catch((err) => {
        console.log(err);
      });
  }

  deletePost(id) {
    const item = this.state.postData.filter((e) => e.id === id)[0];
    docRef
      .update({
        posts: firebase.firestore.FieldValue.arrayRemove(item),
      })
      .then(() => {
        this.setPostsList();
        // this.forceUpdate();
      })
      .catch((e) => {
        console.log(e);
      });
  }

  textToClipboard(text) {
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);

    dummy.value = text;
    dummy.select();

    document.execCommand("copy");
    this.iosCopyToClipboard(dummy);

    document.body.removeChild(dummy);
  }
  iosCopyToClipboard(el) {
    var oldContentEditable = el.contentEditable,
      oldReadOnly = el.readOnly,
      range = document.createRange();

    el.contentEditable = true;
    el.readOnly = false;
    range.selectNodeContents(el);

    var s = window.getSelection();
    s.removeAllRanges();
    s.addRange(range);

    el.setSelectionRange(0, 999999);

    el.contentEditable = oldContentEditable;
    el.readOnly = oldReadOnly;

    document.execCommand("copy");
  }

  render() {
    const { postData } = this.state;

    // const {
    //   allPostItems,

    //   error,
    //   filter,
    //   searchKeyword,
    //   loading,
    //   orderColumn,
    //   labels,
    //   orderColumns,
    //   categories,
    //   selectedItems,
    // } = this.props.surveyListApp;
    // const { messages } = this.props.intl;
    return (
      <Fragment>
        <Row className="app-row survey-app">
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>
                <IntlMessages id="menu.postgenerator" />
              </h1>

              <div className="float-sm-right">
                {/* <Button
                  color="primary"
                  size="lg"
                  className="top-right-button mr-1"
                  onClick={this.toggleModal}
                >
                  <IntlMessages id="survey.add-new" />
                </Button> */}
                <Modal
                  isOpen={this.state.modalOpen}
                  toggle={this.toggleModal}
                  wrapClassName="modal-right"
                  backdrop="static"
                >
                  <ModalHeader toggle={this.toggleModal}>
                    <IntlMessages id="survey.add-new-title" />
                  </ModalHeader>
                  <ModalBody>
                    <Label className="mt-4">
                      <IntlMessages id="survey.title" />
                    </Label>
                    <Input
                      type="text"
                      defaultValue={this.state.title}
                      onChange={(event) => {
                        this.setState({ title: event.target.value });
                      }}
                    />

                    <Label className="mt-4">
                      <IntlMessages id="survey.category" />
                    </Label>
                    <Select
                      components={{ Input: CustomSelectInput }}
                      className="react-select"
                      classNamePrefix="react-select"
                      name="form-field-name"
                      options={[].map((x, i) => {
                        return { label: x, value: x, key: i };
                      })}
                      value={this.state.category}
                      onChange={(val) => {
                        this.setState({ category: val });
                      }}
                    />
                    <Label className="mt-4">
                      <IntlMessages id="survey.label" />
                    </Label>
                    <Select
                      components={{ Input: CustomSelectInput }}
                      className="react-select"
                      classNamePrefix="react-select"
                      name="form-field-name"
                      options={[].map((x, i) => {
                        return {
                          label: x.label,
                          value: x.label,
                          key: i,
                          color: x.color,
                        };
                      })}
                      value={this.state.label}
                      onChange={(val) => {
                        this.setState({ label: val });
                      }}
                    />

                    <Label className="mt-4">
                      <IntlMessages id="survey.status" />
                    </Label>
                    <CustomInput
                      type="radio"
                      id="exCustomRadio"
                      name="customRadio"
                      label="COMPLETED"
                      checked={this.state.status === "COMPLETED"}
                      onChange={(event) => {
                        // this.setState({
                        //   status:
                        //     event.target.value == "on" ? "COMPLETED" : "ACTIVE",
                        // });
                      }}
                    />
                    <CustomInput
                      type="radio"
                      id="exCustomRadio2"
                      name="customRadio2"
                      label="ACTIVE"
                      checked={this.state.status === "ACTIVE"}
                      onChange={(event) => {
                        // this.setState({
                        //   status:
                        //     event.target.value != "on" ? "COMPLETED" : "ACTIVE",
                        // });
                      }}
                    />
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      color="secondary"
                      outline
                      onClick={this.toggleModal}
                    >
                      <IntlMessages id="survey.cancel" />
                    </Button>
                    <Button color="primary" onClick={() => this.addNetItem()}>
                      <IntlMessages id="survey.submit" />
                    </Button>
                  </ModalFooter>
                </Modal>
              </div>

              {/* <BreadcrumbItems match={this.props.match} /> */}
            </div>

            <div className="mb-2">
              {/* <Button
                color="empty"
                id="displayOptions"
                className="pt-0 pl-0 d-inline-block d-md-none"
                onClick={this.toggleDisplayOptions}
              >
                <IntlMessages id="survey.display-options" />{" "}
                <i className="simple-icon-arrow-down align-middle" />
              </Button> */}
            </div>
            <Separator className="mb-5" />
            <Row>
              {postData ? (
                postData.map((item, index) => {
                  return (
                    <Colxx xxs="12" key={index}>
                      <Card className="card d-flex mb-3">
                        <div className="d-flex flex-grow-1 min-width-zero">
                          <CardBody className="align-self-center d-flex flex-column flex-md-row justify-content-between min-width-zero align-items-md-center">
                            <NavLink
                              to="#"
                              id={`toggler${item.id}`}
                              className="list-item-heading mb-0 truncate w-40 w-xs-100  mb-1 mt-1"
                              style={{ cursor: "default" }}
                            >
                              {/* <i
                                onClick={() => {
                                  this.changeItemStatus(item.id);
    
                                }}
                                className={`${
                                   "simple-icon-arrow-right heading-icon"
                                }`}
                                style={
                                  item.status === "COMPLETED"
                                    ? { color: "green" }
                                    : null
                                }
                              /> */}
                              <span className="align-middle d-inline-block">
                                {item.title}
                              </span>
                            </NavLink>
                            <p className="mb-1 text-muted text-small w-15 w-xs-100">
                              {item.category}
                            </p>
                            <p className="mb-1 text-muted text-small w-15 w-xs-100">
                              {item.createDate}
                            </p>
                            <div className="w-15 w-xs-100">
                              <Badge color={item.labelColor} pill>
                                {item.label}
                              </Badge>
                            </div>
                          </CardBody>
                          <div className="custom-control custom-checkbox pl-1 align-self-center pr-4">
                            <i
                              onClick={(e) => {
                                this.deletePost(item.id);
                              }}
                              className={`${"simple-icon-trash heading-icon"}`}
                              onMouseOver={(e) =>
                                (e.target.style.color = "white")
                              }
                              onMouseOut={(e) =>
                                (e.target.style.color = "#D86161")
                              }
                              onMouseDown={(e) =>
                                (e.target.style.color = "green")
                              }
                              onMouseUp={(e) =>
                                (e.target.style.color = "white")
                              }
                              style={{
                                color: "#D86161",
                                cursor: "pointer",
                              }}
                            />
                            <i
                              onClick={(e) => {
                                this.textToClipboard(item.detail);
                              }}
                              className={`${"simple-icon-notebook heading-icon"}`}
                              onMouseOver={(e) =>
                                (e.target.style.color = "white")
                              }
                              onMouseDown={(e) =>
                                (e.target.style.color = "green")
                              }
                              onMouseUp={(e) =>
                                (e.target.style.color = "white")
                              }
                              onMouseOut={(e) =>
                                (e.target.style.color = "grey")
                              }
                              style={{
                                color: "grey",
                                cursor: "pointer",
                              }}
                            />
                            {/* <CustomInput
                              className="itemCheck mb-0"
                              type="checkbox"
                              id={`check_${item.id}`}
                              checked={
                                loading
                                  ? selectedItems.includes(item.id)
                                  : false
                              }
                              onClick={(event) =>
                                this.handleCheckChange(event, item.id)
                              }
                              label=""
                            /> */}
                          </div>
                        </div>
                        <div className="card-body pt-1">
                          <p className="mb-0">{item.detail}</p>
                        </div>
                      </Card>
                    </Colxx>
                  );
                })
              ) : (
                <div className="loading" />
              )}
            </Row>
          </Colxx>
        </Row>

        {/* <ApplicationMenu>
          <PerfectScrollbar
            option={{ suppressScrollX: true, wheelPropagation: false }}
          >
            <div className="p-4">
              <p className="text-muted text-small">
                <IntlMessages id="survey.status" />
                Status
              </p>
              <ul className="list-unstyled mb-5">
                <NavItem className={classnames({ active: !filter })}>
                  <NavLink to="#" onClick={e => this.addFilter("", "")}>
                    <i className="simple-icon-reload" />
                    <IntlMessages id="survey.all-surveys" />
                    <span className="float-right">
                      {loading && allPostItems.length}
                    </span>
                  </NavLink>
                </NavItem>
                <NavItem
                  className={classnames({
                    active:
                      filter &&
                      filter.column === "status" &&
                      filter.value === "ACTIVE"
                  })}
                >
                  <NavLink
                    to="#"
                    onClick={e => this.addFilter("status", "ACTIVE")}
                  >
                    <i className="simple-icon-refresh" />
                    <IntlMessages id="survey.active-surveys" />
                    <span className="float-right">
                      {loading &&
                        surveyItems.filter(x => x.status == "ACTIVE").length}
                    </span>
                  </NavLink>
                </NavItem>
                <NavItem
                  className={classnames({
                    active:
                      filter &&
                      filter.column === "status" &&
                      filter.value === "COMPLETED"
                  })}
                >
                  <NavLink
                    to="#"
                    onClick={e => this.addFilter("status", "COMPLETED")}
                  >
                    <i className="simple-icon-check" />
                    <IntlMessages id="survey.completed-surveys" />
                    <span className="float-right">
                      {loading &&
                        surveyItems.filter(x => x.status == "COMPLETED").length}
                    </span>
                  </NavLink>
                </NavItem>
              </ul>
              <p className="text-muted text-small">
                <IntlMessages id="survey.categories" />
              </p>
              <ul className="list-unstyled mb-5">
                {categories.map((c, index) => {
                  return (
                    <NavItem key={index}>
                      <div onClick={e => this.addFilter("category", c)}>
                        <div className="custom-control custom-radio">
                          <input
                            type="radio"
                            className="custom-control-input"
                            defaultChecked={
                              filter &&
                              filter.column === "category" &&
                              filter.value === c
                            }
                          />
                          <label className="custom-control-label">{c}</label>
                        </div>
                      </div>
                    </NavItem>
                  );
                })}
              </ul>
              <p className="text-muted text-small">
                <IntlMessages id="survey.labels" />
              </p>
              <div>
                {labels.map((l, index) => {
                  return (
                    <p className="d-sm-inline-block mb-1" key={index}>
                      <NavLink
                        to="#"
                        onClick={e => this.addFilter("label", l.label)}
                      >
                        <Badge
                          className="mb-1"
                          color={`${
                            filter &&
                            filter.column === "label" &&
                            filter.value === l.label
                              ? l.color
                              : "outline-" + l.color
                          }`}
                          pill
                        >
                          {l.label}
                        </Badge>
                      </NavLink>
                    </p>
                  );
                })}
              </div>
            </div>
          </PerfectScrollbar>
        </ApplicationMenu>
     */}
      </Fragment>
    );
  }
}

export default PostGenerator;
