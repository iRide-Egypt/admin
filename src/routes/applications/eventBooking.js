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
import ReactAutosuggest from "Components/ReactAutosuggest";

import Select from "react-select";
import CustomSelectInput from "Components/CustomSelectInput";

import { Colxx, Separator } from "Components/CustomBootstrap";
import { NavLink } from "react-router-dom";

import firebase from "firebase";
import { db } from "../../firebase";

const docRef = db.collection("app").doc("riders");
let timer;
class EventBooking extends Component {
  state = {
    //Main Data Lists
    ridersData: null,
    eventsList: [],
    //................

    dropdownSplitOpen: false,
    lastChecked: null,
    displayOptionsIsOpen: false,
    modalOpen: false,

    //Modal Default Data
    isKnowsAboutUs: false,
    age: undefined,
    discount: 0,
    email: undefined,
    event: [{}],
    medicalHistory: undefined,
    name: undefined,
    notes: undefined,
    paymentMethod: undefined,
    phone: undefined,
    riderTag: undefined,
    ridingEx: undefined,
    ridingExNotes: undefined,
    whatsapp: undefined,
    whereKnowUs: undefined,
    //.........................
  };
  componentDidMount() {
    this.setRidersList();
    this.setEventsList();
  }

  componentWillUnmount() {
    if (this._asyncRequest) {
      this._asyncRequest.cancel();
    }
  }

  setRidersList = () => {
    this._asyncRequest = docRef
      .get()
      .then((doc) => {
        if (!doc.data().riders) return;
        this._asyncRequest = null;

        this.setState({ ridersData: doc.data().riders });
      })
      .catch((err) => {
        this.setState({ ridersData: [] });
      });
  };

  setEventsList = () => {
    const eventsDoc = db.collection("app").doc("events");

    this._asyncRequest = eventsDoc
      .get()
      .then((doc) => {
        if (!doc.data().events) return;
        this._asyncRequest = null;

        this.setState({ eventsList: doc.data().events });
      })
      .catch((err) => {
        this.setState({ eventsList: [] });
      });
  };

  onSuggestionChange = (event, { newValue }) => {
    this.setState({
      suggestionValue: newValue,
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
      isKnowsAboutUs: false,
      age: undefined,
      discount: 0,
      email: undefined,
      event: [{}],
      medicalHistory: undefined,
      name: undefined,
      notes: undefined,
      paymentMethod: undefined,
      phone: undefined,
      riderTag: undefined,
      ridingEx: undefined,
      ridingExNotes: undefined,
      whatsapp: undefined,
      whereKnowUs: undefined,
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
    // const { title, category, detail, label, ridersData } = this.state;
    const {
      name,
      event,
      phone,
      whatsapp,
      discount,
      email,
      age,
      medicalHistory,
      ridingEx,
      ridingExNotes,
      whereKnowUs,
      paymentMethod,
      riderTag,
      notes,
      isKnowsAboutUs,
    } = this.state;
    //Obligator: name, event, phone, whatsapp, discount

    const item = {
      name: name,
      event: [event.value],
      phone: phone,
      whatsapp: whatsapp,
      discount: discount,
      email: email,
      age: age,
      medicalHistory: medicalHistory,
      ridingEx: ridingEx.value,
      ridingExNotes: ridingExNotes,
      whereKnowUs: whereKnowUs.value,
      paymentMethod: paymentMethod.value,
      riderTag: riderTag,
      notes: notes,
      isKnowsAboutUs: isKnowsAboutUs,
      creationDate: new Date(),
      createdBy: localStorage.getItem("user_id"),
    };
    // if (
    //   Object.keys(category).length === 0 ||
    //   !detail.length ||
    //   Object.keys(label).length === 0
    // ) {
    //   this.setState({ isError: true });
    //   return;
    // }

    // const id = ridersData.length ? ridersData[0].id + 1 : 0,
    //   date = this.formatDate(new Date()),
    //   labelColor = this.labelColorSwitch(label.value),
    //   autoTitle = title.length
    //     ? title
    //     : detail.split(" ").slice(0, 5).join(" ") + "...";

    // const item = {
    //   createDate: date,
    //   id: id,
    //   title: autoTitle,
    //   detail: detail,
    //   label: label.value,
    //   category: category.value,
    //   labelColor: labelColor,
    // };
    console.log("RIDER's DATA", item);
    docRef
      .update({
        riders: firebase.firestore.FieldValue.arrayUnion(item),
      })
      .then(() => {
        this.setRidersList();
        this.cleanModelState();
        this.toggleModal();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  deletePost(id) {
    const item = this.state.ridersData.filter((e) => e.id === id)[0];
    docRef
      .update({
        posts: firebase.firestore.FieldValue.arrayRemove(item),
      })
      .then(() => {
        this.setRidersList();
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

  handleChangeMulti = (riderTag) => {
    this.setState({ riderTag });
  };
  render() {
    const {
      ridersData,
      isCopied,
      fadeClass,
      errorMessage,
      isError,
      isOpen,
      isOpenList,
      eventsList,
    } = this.state;

    const ridingEx = [
      { label: "Beginner", value: "Beginner" },
      { label: "Normal", value: "Normal" },
      { label: "Hard", value: "Hard" },
    ];

    const paymentMethod = [
      { label: "Vodafone Cash", value: "Vodafone Cash" },
      { label: "Etisalat Cash", value: "Etisalat Cash" },
      { label: "Fawry", value: "Fawry" },
      { label: "Meeting", value: "Meeting" },
      { label: "In The Ride", value: "In The Ride" },
      { label: "Bank Transfer", value: "Bank Transfer" },
      { label: "Other", value: "Other" },
    ];
    const whereKnowUs = [
      { label: "Facebook", value: "Facebook" },
      { label: "Instagram", value: "Instagram" },
      { label: "Website", value: "Website" },
      { label: "Friend", value: "Friend" },
      { label: "Other", value: "Other" },
    ];
    const SELECT_DATA = [
      { label: "7kak", value: "7kak", key: 0 },
      { label: "Byfasel", value: "Byfasel", key: 1 },
      { label: "Byhlek el 5el", value: "Byhlek el 5el", key: 2 },
    ];
    return (
      <Fragment>
        <Row className="app-row survey-app pr-0">
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>
                <IntlMessages id="menu.eventbooking" />
              </h1>

              <div className="float-sm-right">
                <Button
                  color="primary"
                  outline="light"
                  size="lg"
                  className="top-right-button mr-1 px-4"
                  onClick={() => this.toggleModal()}
                >
                  <IntlMessages id="Add New Rider" />
                </Button>
                <Modal
                  isOpen={this.state.modalOpen}
                  toggle={() => this.toggleModal()}
                  wrapClassName="modal-right"
                  // backdrop={true}
                >
                  <ModalHeader toggle={() => this.toggleModal()}>
                    <IntlMessages id="Add New Rider" />
                  </ModalHeader>
                  <ModalBody>
                    <Label className="mt-4">
                      <IntlMessages id="Name *" />
                    </Label>
                    <Input
                      type="text"
                      defaultValue={this.state.name}
                      onChange={(event) => {
                        this.setState({ name: event.target.value });
                      }}
                    />
                    <Label className="mt-4">
                      <IntlMessages id="Event *" />
                    </Label>
                    <Select
                      components={{ Input: CustomSelectInput }}
                      className="react-select"
                      classNamePrefix="react-select"
                      name="form-field-name"
                      options={eventsList.map((x, i) => {
                        return { label: x.label, value: x.value, key: i };
                      })}
                      value={this.state.event}
                      onChange={(val) => {
                        this.setState({ event: val, isError: false });
                      }}
                    />
                    <Label className="mt-4">
                      <IntlMessages id="Phone Number *" />
                    </Label>
                    <Input
                      type="tel"
                      defaultValue={this.state.phone}
                      onChange={(event) => {
                        this.setState({ phone: event.target.value });
                      }}
                    />
                    <Label className="mt-4">
                      <IntlMessages id="Whatsapp Number *" />
                    </Label>
                    <Input
                      type="tel"
                      defaultValue={this.state.whatsapp}
                      onChange={(event) => {
                        this.setState({ whatsapp: event.target.value });
                      }}
                    />

                    <Label className="mt-4">
                      <IntlMessages id="Discount *" />
                    </Label>
                    <Input
                      type="number"
                      defaultValue={this.state.discount}
                      onChange={(event) => {
                        this.setState({ discount: event.target.value });
                      }}
                    />

                    <Separator className="mt-5 mb-5" />

                    <Label className="mt-4">
                      <IntlMessages id="Email" />
                    </Label>
                    <Input
                      type="email"
                      defaultValue={this.state.email}
                      onChange={(event) => {
                        this.setState({ email: event.target.value });
                      }}
                    />

                    <Label className="mt-4">
                      <IntlMessages id="Age" />
                    </Label>
                    <Input
                      type="number"
                      defaultValue={this.state.age}
                      onChange={(event) => {
                        this.setState({ age: event.target.value });
                      }}
                    />

                    <Label className="mt-4">
                      <IntlMessages id="Medical History" />
                    </Label>
                    <Input
                      type="textarea"
                      defaultValue={this.state.medicalHistory}
                      onChange={(event) => {
                        this.setState({
                          medicalHistory: event.target.value,
                          isError: false,
                        });
                      }}
                    />

                    <Label className="mt-4">
                      <IntlMessages id="Riding Experience" />
                    </Label>
                    <Select
                      components={{ Input: CustomSelectInput }}
                      className="react-select"
                      classNamePrefix="react-select"
                      name="form-field-name"
                      options={ridingEx.map((x, i) => {
                        return { label: x.label, value: x.value, key: i };
                      })}
                      value={this.state.ridingEx}
                      onChange={(val) => {
                        this.setState({ ridingEx: val, isError: false });
                      }}
                    />

                    <Label className="mt-4">
                      <IntlMessages id="Riding Experience Notes" />
                    </Label>
                    <Input
                      type="textarea"
                      defaultValue={this.state.ridingExNotes}
                      onChange={(event) => {
                        this.setState({
                          ridingExNotes: event.target.value,
                          isError: false,
                        });
                      }}
                    />

                    <Label className="mt-4">
                      <IntlMessages id="Where did they know us" />
                    </Label>
                    <Select
                      components={{ Input: CustomSelectInput }}
                      className="react-select"
                      classNamePrefix="react-select"
                      name="form-field-name"
                      options={whereKnowUs.map((x, i) => {
                        return {
                          label: x.label,
                          value: x.label,
                          key: i,
                          color: x.color,
                        };
                      })}
                      value={this.state.whereKnowUs}
                      onChange={(val) => {
                        this.setState({ whereKnowUs: val, isError: false });
                      }}
                    />

                    <Label className="mt-4">
                      <IntlMessages id="Payment Method" />
                    </Label>
                    <Select
                      components={{ Input: CustomSelectInput }}
                      className="react-select"
                      classNamePrefix="react-select"
                      name="form-field-name"
                      options={paymentMethod.map((x, i) => {
                        return {
                          label: x.label,
                          value: x.label,
                          key: i,
                          color: x.color,
                        };
                      })}
                      value={this.state.paymentMethod}
                      onChange={(val) => {
                        this.setState({ paymentMethod: val, isError: false });
                      }}
                    />
                    <Label className="mt-4">
                      <IntlMessages id="Tag" />
                    </Label>
                    <Select
                      components={{ Input: CustomSelectInput }}
                      className="react-select"
                      classNamePrefix="react-select"
                      isMulti
                      name="form-field-name"
                      value={this.state.riderTag}
                      onChange={(e) => this.handleChangeMulti(e)}
                      options={SELECT_DATA}
                    />
                    <Label className="mt-4">
                      <IntlMessages id="Notes" />
                    </Label>
                    <Input
                      type="textarea"
                      defaultValue={this.state.notes}
                      onChange={(event) => {
                        this.setState({
                          notes: event.target.value,
                          isError: false,
                        });
                      }}
                    />
                    <CustomInput
                      checked={this.state.isKnowsAboutUs}
                      onChange={(e) => {
                        this.setState({
                          isKnowsAboutUs: e.target.checked,
                          isError: false,
                        });
                      }}
                      className="mt-4"
                      type="checkbox"
                      id="exCustomCheckbox"
                      label="Knows About Our Other Events?"
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
              {ridersData ? (
                ridersData.map((item, index) => {
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
                                  {item.name}
                                </span>
                              </NavLink>
                              <p className="mb-1 text-muted text-small w-15 w-xs-100">
                                {item.ridingEx}
                              </p>
                              <p className="mb-1 text-muted text-small w-15 w-xs-100">
                                {this.formatDate(item.creationDate.toDate())}
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
                              <Row>
                                <Colxx xxs="6">
                                  <p>Notes: {item.notes}</p>
                                  <p>Knows us from: {item.whereKnowUs}</p>
                                  <p>Medical History: {item.medicalHistory}</p>
                                  <p>Riding Experience: {item.ridingEx}</p>
                                  <p>
                                    Tags:{" "}
                                    {item.riderTag.map((e) => {
                                      return (
                                        <Badge
                                          className="mx-1"
                                          color={"danger"}
                                          pill
                                        >
                                          {e.value}
                                        </Badge>
                                      );
                                    })}
                                  </p>
                                 
                                </Colxx>
                                <Colxx xxs="6">
                                  <p>Age: {item.age}</p>
                                  <p>Phone: {item.phone}</p>
                                  <p>Whatsapp: {item.whatsapp}</p>
                                  <p>email: {item.email}</p>
                                  <p>
                                    Events:{" "}
                                    {item.event.map((e) => {
                                      return (
                                        <Badge
                                          className="mx-1"
                                          color={"success"}
                                          pill
                                        >
                                          {e}
                                        </Badge>
                                      );
                                    })}
                                  </p>
                                </Colxx>
                              </Row>
                            </CardBody>
                          </Card>
                        </UncontrolledCollapse>
                      </Colxx>
                    </Fragment>
                  );
                })
              ) : (
                <div className="loading" />
              )}
            </Row>
          </Colxx>
        </Row>
      </Fragment>
    );
  }
}

export default EventBooking;
