import React, { Component, Fragment } from "react";
import IntlMessages from "Util/IntlMessages";
import { injectIntl } from "react-intl";
import DatePicker from "react-datepicker";
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

//Date picker

import moment from "moment";
import TagsInput from "react-tagsinput";
import Switch from "rc-switch";
import ReactAutosuggest from "Components/ReactAutosuggest";
import Rating from "Components/Rating";
import { SliderTooltip, RangeTooltip } from "Components/SliderTooltip";
import FineUploaderTraditional from "fine-uploader-wrappers";
import Gallery from "react-fine-uploader";
import ConfirmationModal from "Components/ConfirmationModal";
import "react-tagsinput/react-tagsinput.css";
import "react-datepicker/dist/react-datepicker.css";
import "rc-switch/assets/index.css";
import "rc-slider/assets/index.css";
import "react-rater/lib/react-rater.css";
import "react-fine-uploader/gallery/gallery.css";
import { NotificationManager } from "Components/ReactNotifications";

const docRef = db.collection("app").doc("events");
let timer;
class EventCreator extends Component {
  state = {
    dropdownSplitOpen: false,
    lastChecked: null,
    displayOptionsIsOpen: false,
    errorMessage: null,

    modalOpen: false,
    //Main Data
    eventsData: null,
    //Modal Data
    type: "",
    eventTag: [],
    program: "",
    notes: "",
    //Date
    eventDate: null,
    eventNumber: null,
  };
  componentDidMount() {
    this.setPostsList();
    this.setEventNumber();
  }

  componentWillUnmount() {
    if (this._asyncRequest) {
      this._asyncRequest.cancel();
    }
  }
  setEventNumber = () => {
    this._asyncRequest = docRef
      .get()
      .then((doc) => {
        if (!doc.data().eventNumber) return;
        this._asyncRequest = null;
        console.log("Event Number ", doc.data().eventNumber);
        this.setState({ eventNumber: doc.data().eventNumber });
      })
      .catch((err) => {
        this.setState({ eventNumber: null });
      });
  };
  incEventNumber = () => {
    const increment = firebase.firestore.FieldValue.increment(1);
    docRef.update({ eventNumber: increment });
  };
  decEventNumber = () => {
    const decrement = firebase.firestore.FieldValue.increment(-1);
    docRef.update({ eventNumber: decrement });
  };
  setPostsList = () => {
    this._asyncRequest = docRef
      .get()
      .then((doc) => {
        if (!doc.data().events) return;
        this._asyncRequest = null;
        console.log(doc.data().events);
        this.setState({ eventsData: doc.data().events.reverse() });
      })
      .catch((err) => {
        this.setState({ eventsData: [] });
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
      type: "",
      eventTag: [],
      program: "",
      notes: "",
      eventDate: null,
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
    const {
      eventsData,
      type,
      eventTag,
      program,
      notes,
      eventDate,
      eventNumber,
    } = this.state;
    const id = eventsData.length ? eventsData[0].id + 1 : 0;
    const label = (type.value || "Anonymous ") + " " + (eventNumber + 1);
    const user = localStorage.getItem("user_id");
    // const status = this.eventStatusGenerator(date);

    const item = {
      eventDate:
        firebase.firestore.Timestamp.fromDate(new Date(eventDate)) ||
        new Date(),
      type: type.value || "",
      program: program.value || "",
      eventTag: eventTag,
      notes: notes,
      id: id,
      label: label,
      value: label,
      creationDate: new Date(),
      createdBy: user,
    };
    // if (
    //   Object.keys(category).length === 0 ||
    //   !notes.length ||
    //   Object.keys(label).length === 0
    // ) {
    //   this.setState({ isError: true });
    //   return;
    // }

    console.log("Modal data: ", item);

    docRef
      .update({
        events: firebase.firestore.FieldValue.arrayUnion(item),
      })
      .then(() => {
        this.incEventNumber();
        this.setPostsList();
        this.notification("You have successfully created a new event!");
        this.cleanModelState();
        this.toggleModal();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  notification(message = "Something Happened!", title = "", style = "filled") {
    NotificationManager.success(message, title, 3000, null, null, style);
  }

  eventStatusGenerator(date, deleted = false) {
    if (deleted) {
      return { status: "CANCELLED", labelColor: "danger" };
    } else
      switch (date) {
        case new Date().after(date):
          return { status: "DONE", labelColor: "success" };
        case new Date().before(date):
          return { status: "In Progress", labelColor: "warning" };

        default:
          return { status: "Unknown", labelColor: "light" };
      }
  }
  isDateBeforeToday(date, deleted = false) {
    if (deleted) {
      return { status: "CANCELED", labelColor: "danger" };
    }
    return new Date(date.toDateString()) < new Date(new Date().toDateString())
      ? { labelColor: "success", status: "DONE" }
      : { labelColor: "warning", status: "In Progress" };
  }
  deletePost(id) {
    const item = this.state.eventsData.filter((e) => e.id === id)[0];
    docRef
      .update({
        events: firebase.firestore.FieldValue.arrayRemove(item),
      })
      .then(() => {
        item.deleted = true;
        docRef.update({
          events: firebase.firestore.FieldValue.arrayUnion(item),
        });
      })
      .then(() => {
        setTimeout(() => {
          this.setPostsList();
          this.notification("You have successfully deleted " + item.label + "!");
        }, 500);
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

  //Date picker

  //   onSuggestionChange = (event, { newValue }) => {
  //     this.setState({
  //       suggestionValue: newValue,
  //     });
  //   };

  //   handleTagChange(tags) {
  //     this.setState({ tags });
  //   }

  handleChangeMulti = (eventTag) => {
    this.setState({ eventTag });
  };

  //   handleChange = (selectedOption) => {
  //     this.setState({ selectedOption });
  //   };

  handleChangeDate(date) {
    console.log(this.formatDate(date));
    this.setState({
      eventDate: date,
    });
  }

  render() {
    const SELECT_DATA = [
      { label: "7kak", value: "7kak", key: 0 },
      { label: "Byfasel", value: "Byfasel", key: 1 },
      { label: "Byhlek el 5el", value: "Byhlek el 5el", key: 2 },
    ];
    const {
      eventsData,
      isCopied,
      fadeClass,
      errorMessage,
      isError,
      isOpen,
      isOpenList,
    } = this.state;

    const studs = [
      { label: "Paid", value: "Paid" },
      { label: "Normal", value: "Normal" },
    ];
    const programs = [
      { label: "Dahab 1", value: "Dahab 1" },
      { label: "Dahab 2", value: "Dahab 2" },
      { label: "Fayyoum 1", value: "Fayyoum 1" },
      { label: "Fayyoum 2", value: "Fayyoum 2" },
      { label: "Giza 1", value: "Giza 1" },
      { label: "Giza 2", value: "Giza 2" },
      { label: "Saqqara 1", value: "Saqqara 1" },
      { label: "Saqqara 2", value: "Saqqara 2" },
    ];
    const types = [
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
                  toggle={() => this.toggleModal()}
                  wrapClassName="modal-right"
                  //   backdrop="static"
                >
                  <ModalHeader toggle={() => this.toggleModal()}>
                    <IntlMessages id="Add New Event" />
                  </ModalHeader>
                  <ModalBody>
                    <Label className="mt-4">
                      <IntlMessages id="Date *" />
                    </Label>
                    <DatePicker
                      selected={this.state.eventDate}
                      onChange={(e) => this.handleChangeDate(e)}
                      placeholderText={"Pick A Date"}
                      dateFormat="DD/MM/YYYY"
                      // minDate={new Date()}
                      maxDate={
                        new Date(new Date().setMonth(new Date().getMonth() + 2))
                      }
                    />

                    <Label className="mt-4">
                      <IntlMessages id="Type *" />
                    </Label>
                    <Select
                      components={{ Input: CustomSelectInput }}
                      className="react-select"
                      classNamePrefix="react-select"
                      name="form-field-name"
                      options={types.map((x, i) => {
                        return {
                          label: x.label,
                          value: x.label,
                          key: i,
                          color: x.color,
                        };
                      })}
                      value={this.state.type}
                      onChange={(val) => {
                        this.setState({ type: val, isError: false });
                      }}
                    />
                    <Label className="mt-4">
                      <IntlMessages id="Program *" />
                    </Label>
                    <Select
                      components={{ Input: CustomSelectInput }}
                      className="react-select"
                      classNamePrefix="react-select"
                      name="form-field-name"
                      options={programs.map((x, i) => {
                        return { label: x.label, value: x.value, key: i };
                      })}
                      value={this.state.program}
                      onChange={(val) => {
                        this.setState({ program: val, isError: false });
                      }}
                    />

                    {/* <Label className="mt-4">
                      <IntlMessages id="Stud" />
                    </Label>
                    <Select
                      components={{ Input: CustomSelectInput }}
                      className="react-select"
                      classNamePrefix="react-select"
                      name="form-field-name"
                      options={studs.map((x, i) => {
                        return {
                          label: x.label,
                          value: x.label,
                          key: i,
                          color: x.color,
                        };
                      })}
                      value={this.state.stud}
                      onChange={(val) => {
                        this.setState({ stud: val, isError: false });
                      }}
                    /> */}
                    <Label className="mt-4">
                      <IntlMessages id="Tag" />
                    </Label>
                    <Select
                      components={{ Input: CustomSelectInput }}
                      className="react-select"
                      classNamePrefix="react-select"
                      isMulti
                      name="form-field-name"
                      value={this.state.eventTag}
                      onChange={(e) => this.handleChangeMulti(e)}
                      options={SELECT_DATA}
                    />

                    {/* <Label className="mt-4">
                      <IntlMessages id="survey.title" />
                    </Label>
                    <Input
                      type="text"
                      defaultValue={this.state.title}
                      onChange={(event) => {
                        this.setState({ title: event.target.value });
                      }}
                    /> */}

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
              <i className="simple-icon-reload align-middle ml-auto" style={{cursor:"pointer"}}onClick={()=>this.setPostsList()}/>
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
              {eventsData ? (
                eventsData.map((item, index) => {
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
                                    this.isArabic(item.notes)
                                      ? "align-middle d-inline-block rtl"
                                      : "align-middle d-inline-block"
                                  }
                                >
                                  {item.label}
                                </span>
                              </NavLink>
                              <p className="mb-1 text-muted text-small w-15 w-xs-100">
                                {item.type.label}
                              </p>
                              <p className="mb-1 text-muted text-small w-15 w-xs-100">
                                {this.formatDate(item.eventDate.toDate())}
                              </p>
                              <div className="w-15 w-xs-100">
                                <Badge
                                  color={
                                    this.isDateBeforeToday(
                                      item.eventDate.toDate(),
                                      item.deleted
                                    ).labelColor
                                  }
                                  pill
                                >
                                  {
                                    this.isDateBeforeToday(
                                      item.eventDate.toDate(),
                                      item.deleted
                                    ).status
                                  }
                                </Badge>
                              </div>
                            </CardBody>
                            {!item.deleted ? (
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
                              </div>
                            ) : (
                              <div />
                            )}
                          </div>
                        </Card>
                      </Colxx>

                      {/* 2nd Card */}
                      <Colxx xxs="12">
                        <UncontrolledCollapse toggler={"#toggler" + item.id}>
                          <Card className="mb-3">
                            <CardBody>{item.notes}</CardBody>
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

export default EventCreator;
