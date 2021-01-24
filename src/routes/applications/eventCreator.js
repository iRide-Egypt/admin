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
  Accordion,
  Toggle,
  CardHeader,
  UncontrolledCollapse,
} from "reactstrap";

import Select from "react-select";
import CustomSelectInput from "Components/CustomSelectInput";

import { Colxx, Separator } from "Components/CustomBootstrap";
import { NavLink } from "react-router-dom";

import firebase from "firebase";
import { db } from "../../firebase";

const docRef = db.collection("app").doc("eventCreator");
let timer;
class EventCreator extends Component {
  state = {
    eventsData: null,
    dropdownSplitOpen: false,
    lastChecked: null,
    displayOptionsIsOpen: false,
    errorMessage: null,
    isCopied: false,
    isOpen: false,
    isOpenList: {},
    //Modal
    modalOpen: false,
    title: "",
    label: {},
    category: {},
    status: "ACTIVE",
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
      if (!doc.data().events) return;
      this._asyncRequest = null;

      this.setState({ eventsData: doc.data().events });
    });
  };

  toggleDisplayOptions() {
    this.setState({ displayOptionsIsOpen: !this.state.displayOptionsIsOpen });
  }

  toggleModal() {
    this.setState((prevState) => {
      return {
        ...prevState,
        modalOpen: !prevState.modalOpen,
      };
    });
  }

  toggleSplit() {
    this.setState((prevState) => ({
      dropdownSplitOpen: !prevState.dropdownSplitOpen,
    }));
  }
  formatDate(date) {
    const ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(date);
    const mo = new Intl.DateTimeFormat("en", { month: "short" }).format(date);
    const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);
    if (
      ye !==
      new Intl.DateTimeFormat("en", { year: "numeric" }).format(new Date())
    ) {
      return `${da}-${mo}-${ye}`;
    } else {
      return `${da}-${mo}`;
    }
  }
  cleanModelState() {
    this.setState({
      title: "",
      category: {},
      detail: "",
      label: {},
    });
  }
  labelColorSwitch(label) {
    switch (label) {
      case "Dahab":
        return "danger";
      case "Fayyoum":
        return "success";
      case "Giza":
        return "warning";
      case "Saqqara":
        return "info";

      default:
        return "light";
    }
  }
  addPost() {
    const { title, category, detail, label, eventsData } = this.state;

    if (
      Object.keys(category).length === 0 ||
      !detail.length ||
      Object.keys(label).length === 0
    ) {
      this.setState({ isError: true });
      return;
    }

    const id = eventsData.length ? eventsData[0].id + 1 : 0,
      date = this.formatDate(new Date()),
      labelColor = this.labelColorSwitch(label.value),
      autoTitle = title.length
        ? title
        : detail.split(" ").slice(0, 5).join(" ") + "...";

    const item = {
      createDate: date,
      id: id,
      title: autoTitle,
      detail: detail,
      label: label.value,
      category: category.value,
      labelColor: labelColor,
    };

    docRef
      .update({
        riders: firebase.firestore.FieldValue.arrayUnion(item),
      })
      .then(() => {
        this.setPostsList();
        this.cleanModelState();
        this.toggleModal();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  deletePost(id) {
    const item = this.state.eventsData.filter((e) => e.id === id)[0];
    docRef
      .update({
        posts: firebase.firestore.FieldValue.arrayRemove(item),
      })
      .then(() => {
        this.setPostsList();
      })
      .catch((e) => {
        console.log(e);
      });
  }
  isArabic(text) {
    var pattern = /[\u0600-\u06FF\u0750-\u077F]/;
    console.log(pattern.test(text));
    return pattern.test(text);
  }
  textToClipboard(text) {
    clearInterval(timer);
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);

    dummy.value = text;
    dummy.select();

    document.execCommand("copy");
    this.iosCopyToClipboard(dummy);
    this.setState({ isCopied: true });

    document.body.removeChild(dummy);

    timer = setTimeout(() => {
      this.setState({ isCopied: false });
    }, 3000);
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
  toggleAccordion(id) {
    let isOpenList = {
      1: true,
    };

    this.setState((prevState) => {
      return {
        ...prevState,
        isOpenList: { ...!isOpenList[id] },
      };
    });
  }
  render() {
    const {
      eventsData,
      isCopied,
      fadeClass,
      errorMessage,
      isError,
      isOpen,
      isOpenList,
    } = this.state;

    const categories = [
      { label: "Paid", value: "Paid" },
      { label: "Normal", value: "Normal" },
    ];
    const labels = [
      { label: "General", value: "General" },
      { label: "Dahab", value: "Dahab" },
      { label: "Fayyoum", value: "Fayyoum" },
      { label: "Giza", value: "Giza" },
      { label: "Saqqara", value: "Saqqara" },
    ];
    return (
      <Fragment>
        <Row className="app-row survey-app pr-0">
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>
                <IntlMessages id="menu.eventcreator" />
              </h1>

              <div className="float-sm-right">
                <Button
                  color="primary"
                  outline="light"
                  size="lg"
                  className="top-right-button mr-1 px-4"
                  onClick={() => this.toggleModal()}
                >
                  <IntlMessages id="Add New Event" />
                </Button>
                <Modal
                  isOpen={this.state.modalOpen}
                  toggle={this.toggleModal}
                  wrapClassName="modal-right"
                  backdrop="static"
                >
                  <ModalHeader toggle={() => this.toggleModal()}>
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
                      <IntlMessages id="todo.detail" />
                    </Label>
                    <Input
                      type="textarea"
                      defaultValue={this.state.detail}
                      onChange={(event) => {
                        this.setState({
                          detail: event.target.value,
                          isError: false,
                        });
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
                      options={categories.map((x, i) => {
                        return { label: x.label, value: x.value, key: i };
                      })}
                      value={this.state.category}
                      onChange={(val) => {
                        this.setState({ category: val, isError: false });
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
                      options={labels.map((x, i) => {
                        return {
                          label: x.label,
                          value: x.label,
                          key: i,
                          color: x.color,
                        };
                      })}
                      value={this.state.label}
                      onChange={(val) => {
                        this.setState({ label: val, isError: false });
                      }}
                    />

                    {/* <Label className="mt-4">
                      <IntlMessages id="survey.status" />
                    </Label>
                    <CustomInput
                      type="radio"
                      id="exCustomRadio"
                      name="customRadio"
                      label="COMPLETED"
                      checked={this.state.status === "COMPLETED"}
                      onChange={(event) => {
                        this.setState({
                          status:
                            event.target.value == "on" ? "COMPLETED" : "ACTIVE",
                        });
                      }}
                    /> */}
                    {/* <CustomInput
                      type="radio"
                      id="exCustomRadio2"
                      name="customRadio2"
                      label="ACTIVE"
                      checked={this.state.status === "ACTIVE"}
                      onChange={(event) => {
                        this.setState({
                          status:
                            event.target.value != "on" ? "COMPLETED" : "ACTIVE",
                        });
                      }}
                    /> */}
                  </ModalBody>
                  {isError && (
                    <p className="text-danger text-center">
                      Detail, Category and Label must be filled!
                    </p>
                  )}
                  <ModalFooter>
                    <Button
                      color="danger"
                      outline
                      onClick={() => this.toggleModal()}
                    >
                      <IntlMessages id="survey.cancel" />
                    </Button>
                    <Button
                      color="primary"
                      outline="light"
                      onClick={() => this.addPost()}
                    >
                      <IntlMessages id="survey.submit" />
                    </Button>
                  </ModalFooter>
                </Modal>
              </div>
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
              {[
                {
                  title: "Dahab",
                  detail: "A7la mesa 3l nas el kwysa",
                  id: 0,
                  createDate:"13/2/2021",
                  label:"Cancelled",
                  labelColor:"danger",
                  category:"5/25"
                },
                {
                  title: "Giza",
                  detail: "A7la mesa 3l nas el kwysa",
                  id: 1,
                  createDate:"20/2/2021",
                  label:"In Progress",
                  labelColor:"warning",
                  category:"27/25"
                },
                {
                  title: "Fayyoum",
                  detail: "A7la mesa 3l nas el kwysa",
                  id: 2,
                  createDate:"2/1/2021",
                  label:"Finished",
                  labelColor:"success",
                  category:"15/25"
                },
                {
                  title: "Saqqara",
                  detail: "A7la mesa 3l nas el kwysa",
                  id: 3,
                  createDate:"30/2/2021",
                  label:"Draft",
                  labelColor:"light",
                  category:"19/25"
                },
                
              ].map((item, index) => {
                return (
                  <Fragment key={0}>
                    <Colxx xxs="12" key={index}>
                      <Card className="card d-flex mb-1">
                        <div className="d-flex flex-grow-1 min-width-zero">
                          <CardBody className="py-3 align-self-center d-flex flex-column flex-md-row justify-content-between min-width-zero align-items-md-center">
                            <NavLink
                              to="#"
                              id={`toggler${item.id}`}
                              className="list-item-heading mb-0 truncate w-40 w-xs-100  mb-1 mt-1"
                              style={{ cursor: "default" }}
                              // onClick={() => this.toggleAccordion(item.id)}
                            >
                              <span
                                className={
                                  this.isArabic(item.detail)
                                    ? "align-middle d-inline-block rtl"
                                    : "align-middle d-inline-block"
                                }
                              >
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
                              onClick={() => {
                                this.deletePost(item.id);
                              }}
                              className={`${"simple-icon-trash heading-icon mr-3"}`}
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
                   
                          </div>
                        </div>
                      </Card>
                    </Colxx>

                    {/* 2nd Card */}
                    <Colxx xxs="12">
                    <UncontrolledCollapse toggler={"#toggler" + item.id}>
                        <Card className="mb-3">
                          <CardBody>
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Nesciunt magni, voluptas debitis similique
                            porro a molestias consequuntur earum odio officiis
                            natus, amet hic, iste sed dignissimos esse fuga!
                            Minus, alias.
                          </CardBody>
                        </Card>
                      </UncontrolledCollapse>
                    </Colxx>
                  </Fragment>
                );
              })}
     
            </Row>
            {isCopied ? (
              <div
                className={
                  "btn btn-warning py-1 px-1 fixed-bottom rounded-pill fadeIn"
                }
                style={{
                  left: "45%",
                  bottom: "60px",
                  width: "150px",
                  cursor: "default",
                }}
              >
                Copied to clipboard
              </div>
            ) : null}
          </Colxx>
        </Row>
      </Fragment>
    );
  }
}

export default EventCreator;
