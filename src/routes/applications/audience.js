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
import ConfirmationModal from "Components/ConfirmationModal";
import Select from "react-select";
import Switch from "rc-switch";
import CustomSelectInput from "Components/CustomSelectInput";

import { Colxx, Separator } from "Components/CustomBootstrap";
import { NavLink } from "react-router-dom";

import firebase from "firebase";
import { db } from "../../firebase";
import { NotificationManager } from "Components/ReactNotifications";
import { getUserById, getCurrentUser } from "../../util/Utils";

const docRef = db.collection("app").doc("riders");
let timer;
class Audience extends Component {
  state = {
    //Main Data Lists
    ridersList: null,
    eventsList: [],
    //................

    dropdownSplitOpen: false,
    lastChecked: null,
    displayOptionsIsOpen: false,
    modalOpen: false,

    //Modal Default Data
    isKnowsAboutUs: false,
    age: "",
    discount: 0,
    email: "",
    event: null,
    booker: null,
    medicalHistory: "",
    name: null,
    notes: "",
    paymentMethod: {},
    phone: "",
    riderTag: [],
    ridingEx: {},
    ridingExNotes: "",
    whatsapp: "",
    whereKnowUs: {},
    isPaid:false,
    isWhatsapp:true,
    isWithSomeone:false,
    isSceenshotSent:false
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

        this.setState({ ridersList: doc.data().riders.reverse() });
      })
      .catch((err) => {
        this.setState({ ridersList: [] });
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
      isPaid:false,
      isSceenshotSent:false,
      isSaqqara:false
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
    // const { title, category, detail, label, ridersList } = this.state;
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
      ridersList,
      isPaid,
      isSceenshotSent
    } = this.state;
    //Obligator: name, event, phone, whatsapp, discount
    const id = ridersList.length ? ridersList[0].id + 1 : 0;

    const item = {
      name: name,
      event: [event.value||""],
      phone: phone,
      whatsapp: whatsapp,
      discount: discount,
      email: email,
      age: age,
      medicalHistory: medicalHistory,
      ridingEx: ridingEx.value || "",
      ridingExNotes: ridingExNotes,
      whereKnowUs: whereKnowUs.value || "",
      paymentMethod: paymentMethod.value || "",
      riderTag: riderTag || [{label:"", value:"", key:""}],
      notes: notes,
      isKnowsAboutUs: isKnowsAboutUs,
      isPaid:isPaid,
      isSceenshotSent:isSceenshotSent,
      id: id,
      creationDate: new Date(),
      createdBy: localStorage.getItem("user_id"),
    };

    console.log("RIDER's DATA", item);
    docRef
      .update({
        riders: firebase.firestore.FieldValue.arrayUnion(item),
      })
      .then(() => {
        this.setRidersList();
        this.notification("You have successfully created a new rider!")
        this.cleanModelState();
        this.toggleModal();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  deletePost(id) {
    const item = this.state.ridersList.filter((e) => e.id === id)[0];
    docRef
      .update({
        riders: firebase.firestore.FieldValue.arrayRemove(item),
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
  notification(message="Something Happened!", title="", style="filled"){
    NotificationManager.success(
      message,
      title,
      3000,
      null,
      null,
      style
    );
  }
  handleChangeMulti = (riderTag) => {
    this.setState({ riderTag });
  };

  toggleSmall() {
    this.setState({
      modalSmall: !this.state.modalSmall,
    });
  }
  selectMenuCurrentUser(){
    const currentUser= getCurrentUser();
    return {label: currentUser.name, value: currentUser.id, key:2};
  }

  render() {
    const {
      ridersList,
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
    const bookersList = [
      { label: getUserById("L41uJRz4V2ZaYTbRnyJ0DfFEke72").name, value: "L41uJRz4V2ZaYTbRnyJ0DfFEke72" },
      { label: getUserById("yRGROLqSIZUyj2DSujoqfvLCqVV2").name, value: "yRGROLqSIZUyj2DSujoqfvLCqVV2" },
      { label: getUserById("ChzYvzJR0WhHn4dunrPiS26ir9q2").name, value: "ChzYvzJR0WhHn4dunrPiS26ir9q2" },
      { label: "Mamdoh", value: "Mamdoh" },
      { label: getUserById("byN8fQxFkpaJJdi5OzfQhKywqiy2").name, value: "byN8fQxFkpaJJdi5OzfQhKywqiy2" },
      { label: "Hala", value: "Hala" },
      { label: getUserById("NYnE9NoeKiT08U05AmK2ijPpcvV2").name, value: "NYnE9NoeKiT08U05AmK2ijPpcvV2" },
      { label: "Ouzo", value: "Ouzo" },
    ]
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
                  {this.state.event && <div><Label className="mt-4">
                      <IntlMessages id="With someone?" />
                    </Label>
                    <Switch
                      className="custom-switch custom-switch-primary"
                      checked={this.state.isWithSomeone}
                      onChange={(isWithSomeone) => {
                        this.setState({ isWithSomeone });
                      }}
                    /></div>}
                    {this.state.isWithSomeone && <div>
                    <Label className="mt-4">
                      <IntlMessages id="With who?" />
                    </Label>
                    <Select
                      components={{ Input: CustomSelectInput }}
                      className="react-select"
                      classNamePrefix="react-select"
                      name="form-field-name"
                      options={ridersList.filter((x) => x.event.includes(this.state.event.value)).map((x, i) => {
                        console.log("RIDERSLIST || ", this.state.event.value)
                        return { label: x.name, value: x.id, key: i };
                      })}
                      value={this.state.withWho}
                      onChange={(val) => {
                        this.setState({ withWho: val, isError: false });
                      }}
                    />
                      </div>}
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
                      <IntlMessages id="Booking *" />
                    </Label>
                    <Select
                      components={{ Input: CustomSelectInput }}
                      className="react-select"
                      classNamePrefix="react-select"
                      name="form-field-name"
                      isSearchable={false}
                      options={bookersList.map((x, i) => {
                        return { label: x.label, value: x.value, key: i };
                      })}
                      value={this.state.booker || this.selectMenuCurrentUser()}
                      onChange={(val) => {
                        this.setState({ booker: val, isError: false });
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
                     <CustomInput
                            checked={this.state.isWhatsapp}
                            onChange={(e) => {
                              this.setState({
                                isWhatsapp: e.target.checked,
                                isError: false,
                              });
                            }}
                            className="mt-4"
                            type="checkbox"
                            id="exCustomCheckbox3"
                            label="Whatsapp on this number?"
                          />
                   {!this.state.isWhatsapp && <div><Label className="mt-4">
                      <IntlMessages id="Whatsapp Number *" />
                    </Label>
                    <Input
                      type="tel"
                      defaultValue={this.state.whatsapp}
                      onChange={(event) => {
                        this.setState({ whatsapp: event.target.value });
                      }}
                    /></div>}
                      
                          <CustomInput
                            checked={this.state.isPaid}
                            onChange={(e) => {
                              this.setState({
                                isPaid: e.target.checked,
                                isError: false,
                              });
                            }}
                            className="mt-4"
                            type="checkbox"
                            id="exCustomCheckbox2"
                            label="Paid?"
                          />
                    {this.state.isPaid && <div>
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
                    {this.state.paymentMethod.value==="Vodafone Cash" && (
                      <Row>
                          <Colxx lg="5">
                          <CustomInput
                            checked={this.state.isSceenshotSent}
                            onChange={(e) => {
                              this.setState({
                                isSceenshotSent: e.target.checked,
                                isError: false,
                              });
                            }}
                            className="mt-4"
                            type="checkbox"
                            id="exCustomCheckbox1"
                            label="Screenshot sent to Shokry?"
                          />
                        </Colxx>
                      </Row>
                    )}
                    </div>
                    }


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
              {ridersList ? (
                ridersList.map((item, index) => {
                  return (
                    <Fragment key={index}>
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
                              <ConfirmationModal
                                button={
                                  <i
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
                                }
                                action={() => this.deletePost(item.id)}
                              />
                              {/* <i
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
                              /> */}
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

export default Audience;
