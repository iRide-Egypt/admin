import React, { Component, Fragment } from "react";
import IntlMessages from "Util/IntlMessages";
import DatePicker from "react-datepicker";
import {
  Row,
  Card,
  CardBody,
  Button,
  Badge,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  UncontrolledCollapse,
} from "reactstrap";

import Select from "react-select";
import CustomSelectInput from "Components/CustomSelectInput";

import { Colxx, Separator } from "Components/CustomBootstrap";
import { NavLink } from "react-router-dom";

import firebase from "firebase";
import { db } from "../../firebase";

//Date picker

import ConfirmationModal from "Components/ConfirmationModal";
import "react-tagsinput/react-tagsinput.css";
import "react-datepicker/dist/react-datepicker.css";
import "rc-switch/assets/index.css";
import "rc-slider/assets/index.css";
import "react-rater/lib/react-rater.css";
import "react-fine-uploader/gallery/gallery.css";
import { NotificationManager } from "Components/ReactNotifications";
import PullToRefresh from 'react-simple-pull-to-refresh';

const docRef = db.collection("app").doc("events");
const docRidersRef = db.collection("app").doc("riders");

class EventCreator extends Component {
  state = {
    dropdownSplitOpen: false,
    lastChecked: null,
    displayOptionsIsOpen: false,
    errorMessage: null,

    modalOpen: false,
    modalEditOpen:false,
    //Main Data
    eventsData: null,
    //Modal Data
    type: "",
    organiser: [],
    program: {},
    notes: "",
    //Date
    ridersData: null,
    eventDate: null,
    eventNumber: null,
  };
  componentDidMount() {
    this.setPostsList();
    this.setRidersList();
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
        this.setState({ eventNumber: doc.data().eventNumber });
      })
      .catch(() => {
        this.setState({ eventNumber: null });
      });
  };
  incEventNumber = () => {
    const increment = firebase.firestore.FieldValue.increment(1);
    docRef.update({ eventNumber: increment });
  };
  setRidersList = () => {
    this._asyncRequest = docRidersRef
      .get()
      .then((doc) => {
        if (!doc.data().riders) return;
        this._asyncRequest = null;

        this.setState({ ridersData: doc.data().riders.reverse() });
      })
      .catch(() => {
        this.setState({ ridersData: [] });
      });
  };
  setPostsList = () => {
    return this._asyncRequest = docRef
      .get()
      .then((doc) => {
        if (!doc.data().events) return;
        this._asyncRequest = null;
        this.setState({ eventsData: doc.data().events.reverse() });
      })
      .catch(() => {
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
  formatDate(date) {
    const ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(date);
    const mo = new Intl.DateTimeFormat("en", { month: "2-digit" }).format(date);
    const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);
    if (
      ye !==
      new Intl.DateTimeFormat("en", { year: "numeric" }).format(new Date())
    ) {
      return `${da}/${mo}/${ye}`;
    } else {
      return `${da}/${mo}`;
    }
  }
  cleanModelState() {
    this.setState({
      type: "",
      organiser: [],
      program: "",
      notes: "",
      eventDate: null,
    });
  }
  addPost() {
    const {
      eventsData,
      type,
      organiser,
      program,
      notes,
      eventDate,
      eventNumber,
    } = this.state;
    const id = eventsData.length ? eventsData[0].id + 1 : 0;
    const programValue = program.value||"";
    const time = programValue.toLowerCase()==="morning"?"|9AM":programValue.toLowerCase()==="afternoon"?"|2PM":"";
  
    const label = `${type.value || "Anonymous "} |${this.formatDate(eventDate.toDate())}${time}`;
    const user = localStorage.getItem("user_id");

    const item = {
      eventDate:
        firebase.firestore.Timestamp.fromDate(new Date(eventDate)) ||
        new Date(),
      type: type.value || "",
      program: program.value || "",
      organiser: organiser,
      notes: notes,
      id: id,
      label: label,
      value: label,
      creationDate: new Date(),
      createdBy: user,
    };
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

  errorNotification(message = "Something Happened!", title = "", style = "filled") {
    NotificationManager.error(message, title, 3000, null, null, style);
  }
  notification(message = "Something Happened!", title = "", style = "filled") {
    NotificationManager.success(message, title, 3000, null, null, style);
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
          this.notification(
            "You have successfully deleted " + item.label + "!"
          );
        }, 500);
      })
      .catch((e) => {
        console.log(e);
      });
  }
  isArabic(text) {
    var pattern = /[\u0600-\u06FF\u0750-\u077F]/;
    return pattern.test(text);
  }
  handleChangeMulti = (organiser) => {
    this.setState({ organiser });
  };
  getRidersForEvent = (eventNumber) => {
    const { ridersData } = this.state;
    if (!ridersData) return;
    this._asyncRequest = null;
    if (ridersData) {
      const ridersWithMatchingEvent = ridersData.filter((rider) =>
        rider.event.includes(eventNumber)
      );
      return ridersWithMatchingEvent;
    }
  };
  setEditModelInputValues(item) {
    this.setState({
      type: { label: item.type, value: item.type } || {},
      organiser: item.organiser,
      program: { label: item.program, value: item.program } || {},
      notes: item.notes,
      eventDate: null,
    });
  }
  editPost() {
    const id = this.state.editPostId;
    const olditem = this.state.eventsData.filter((e) => e.id === id)[0];
    const {
      type,
      organiser,
      program,
      notes
    } = this.state;
    const programValue = program.value||"";
    const time = programValue.toLowerCase()==="morning"?"|9AM":programValue.toLowerCase()==="afternoon"?"|2PM":"";
    const label = `${type.value || "Anonymous "} |${this.formatDate(olditem.eventDate.toDate())}${time}`;


    const item = {
      ...olditem,
      label:label,
      value:label,
      type: type.value || "",
      organiser,
      program: program.value || "",
      notes
    };
    console.log("OLD ITEM || ", olditem)
    console.log("NEW ITEM || ", item)
    docRef
      .update({
        events: firebase.firestore.FieldValue.arrayRemove(olditem),
      })
      .then(() => {
        docRef
          .update({
            events: firebase.firestore.FieldValue.arrayUnion(item),
          })
          .then(() => {
            this.notification("You have edited " + item.name + " !");
            this.setPostsList();
            this.cleanModelState();
            this.toggleModalEdit();
          })
          .catch((e) => console.log(e));
      })
      .catch((e) => {
        console.log(e)
        this.errorNotification("ERRRRROOOOR");
      });
  }

  toggleModalEdit() {
    this.setState((prevState) => {
      return {
        ...prevState,
        modalEditOpen: !prevState.modalEditOpen,
      };
    });
  }
  generatEventName(eventType, eventDate, program){
    const time = program.toLowerCase()==="morning"?"|9AM":program.toLowerCase()==="afternoon"?"|2PM":"";
    return `iRide | ${eventType} |${this.formatDate(eventDate.toDate())}${time}`;
  }
  handleChangeDate(date) {
    this.setState({
      eventDate: date,
    });
  }

  render() {
    const {
      eventsData,
      ridersData,
      isError,
    } = this.state;

    const programs = [
      { label: "Morning", value: "Morning" },
      { label: "Afternoon", value: "Afternoon" },
      { label: "Other", value: "Other" }
    ];
    const types = [
      { label: "Giza", value: "Giza" },
      { label: "Saqqara", value: "Saqqara" },
      { label: "Fayyoum", value: "Fayyoum" },
      { label: "Dahab", value: "Dahab" },
      { label: "Sphinx", value: "Sphinx" },
      { label: "Portsaid", value: "Portsaid" },
    ];
    const SELECT_DATA = [
      { label: "Abdullah", value: "Abdullah", key: 0 },
      { label: "Gohary", value: "Gohary", key: 1 },
      { label: "Mamdoh", value: "Mamdoh", key: 2 },
      { label: "Shokry", value: "Shokry", key: 3 },
      { label: "Ouzo", value: "Ouzo", key: 4 },
      { label: "Khloud", value: "Khloud", key: 5 },
      { label: "Moaz", value: "Moaz", key: 6 },
      { label: "Hala", value: "Hala", key: 7 },
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
                      key={Math.random()}
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
                    <Label className="mt-4">
                      <IntlMessages id="Organiser" />
                    </Label>
                    <Select
                      components={{ Input: CustomSelectInput }}
                      className="react-select"
                      classNamePrefix="react-select"
                      isMulti
                      name="form-field-name"
                      value={this.state.organiser}
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

                 {/* Edit Modal */}
                 <Modal
                  isOpen={this.state.modalEditOpen}
                  toggle={() => {
                    this.toggleModalEdit();
                    //this.cleanModelState();
                  }}
                  wrapClassName="modal-right"
                  //   backdrop="static"
                >
                  <ModalHeader   toggle={() => {
                      this.toggleModalEdit();
                      
                    }}>
                    <IntlMessages id="Edit Event" />
                  </ModalHeader>
                  <ModalBody>
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
                    <Label className="mt-4">
                      <IntlMessages id="Organiser" />
                    </Label>
                    <Select
                      components={{ Input: CustomSelectInput }}
                      className="react-select"
                      classNamePrefix="react-select"
                      isMulti
                      name="form-field-name"
                      value={this.state.organiser}
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
                      onClick={() => {
                        this.toggleModalEdit();
                        //this.cleanModelState();
                      }}
                    >
                      <IntlMessages id="survey.cancel" />
                    </Button>
                    <Button
                      color="primary"
                      outline="light"
                      onClick={() => this.editPost()}
                    >
                      <IntlMessages id="survey.submit" />
                    </Button>
                  </ModalFooter>
                </Modal>
              </div>
            </div>

            <div className="mb-2" >
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
            <PullToRefresh onRefresh={this.setPostsList}>
            <Row>
              {eventsData ? (
                eventsData.map((item, index) => {
                  return (
                    <Fragment key={item.id+Math.random()}>
                      <Colxx xxs="12" key={item.id}>
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
                                  {this.generatEventName(item.type, item.eventDate, item.program)}
                                </span>
                              </NavLink>
                              <p className="mb-1 text-muted text-small w-15 w-xs-100">
                                {item.organiser.map(i=>i.value).join(", ")}
                              </p>
                              <p className="mb-1 text-muted text-small w-15 w-xs-100">
                                {item.program}
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
                              <div className="custom-control custom-checkbox pl-1 align-self-center pr-4" style={{ display: "inline-flex" }}>
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
                                                              <i
                                className={`${"simple-icon-wrench heading-icon ml-2 mr-3"}`}
                                onMouseOver={(e) =>
                                  (e.target.style.color = "white")
                                }
                                onMouseOut={(e) =>
                                  (e.target.style.color = "orange")
                                }
                                onMouseDown={(e) =>
                                  (e.target.style.color = "green")
                                }
                                onMouseUp={(e) =>
                                  (e.target.style.color = "white")
                                }
                                style={{
                                  color: "orange",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  console.log("EDIT ITEM ||",item);
                                  this.setEditModelInputValues(item);
                                  this.toggleModalEdit();
                                  this.setState({ editPostId: item.id });
                                }}
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
                            <CardBody>
                              <Card
                                className={
                                  this.isArabic(item.notes)
                                    ? "align-middle d-inline-block rtl"
                                    : "align-middle d-inline-block"
                                }
                              >
                                <div
                                  className="d-flex"
                                  style={{ flexWrap: "wrap" }}
                                >
                                  {ridersData ? (
                                    this.getRidersForEvent(item.label).map(
                                      (rider, index) => {
                                        return (
                                          <Badge key={index} pill color="success">
                                            {index + 1}. {rider.name} -{" "}
                                            {rider.phone} - dis:{rider.discount}
                                          </Badge>
                                        );
                                      }
                                    )
                                  ) : (
                                    <span></span>
                                  )}
                                </div>
                              </Card>
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
            </PullToRefresh>
          </Colxx>
        </Row>
      </Fragment>
    );
  }
}

export default EventCreator;
