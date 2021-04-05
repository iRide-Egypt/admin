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
import Switch from "rc-switch";
import ReactAutosuggest from "Components/ReactAutosuggest";
import ConfirmationModal from "Components/ConfirmationModal";
import Select from "react-select";
import CustomSelectInput from "Components/CustomSelectInput";

import { Colxx, Separator } from "Components/CustomBootstrap";
import { NavLink } from "react-router-dom";

import firebase from "firebase";
import { db } from "../../firebase";
import { NotificationManager } from "Components/ReactNotifications";

const docRef = db.collection("app").doc("contacts");
let timer;
class Contacts extends Component {
  state = {
    //Main Data Lists
    contactsList: null,
    eventsList: [],
    //................

    dropdownSplitOpen: false,
    lastChecked: null,
    displayOptionsIsOpen: false,
    modalOpen: false,
    modalEditOpen: false,

    //Modal Default Data
    isKnowsAboutUs: false,
    age: "",
    gender: "",
    discount: 0,
    email: "",
    event: [{}],
    medicalHistory: "",
    name: "",
    notes: "",
    paymentMethod: {},
    phone: "",
    riderTag: [],
    ridingEx: {},
    ridingExNotes: "",
    whatsapp: "",
    whereKnowUs: {},
    isCar: false,
    isBreakfast: false,
    //.........................
    editPostId: 0,
    searchKeyword: "",
    switchCheckedPrimary: false,
    bulkText:""
  };
  componentDidMount() {
    this.setContactsList();
    // this.setRidersList();
    // this.setEventsList();
  }

  componentWillUnmount() {
    if (this._asyncRequest) {
      this._asyncRequest.cancel();
    }
  }

  setContactsList = () => {
    this._asyncRequest = docRef
      .get()
      .then((doc) => {
        if (!doc.data().contacts) return;
        this._asyncRequest = null;

        this.setState({ contactsList: doc.data().contacts.reverse() });
      })
      .catch((err) => {
        this.setState({ contactsList: [] });
      });
  };
  setRidersList = () => {
    this._asyncRequest = docRef
      .get()
      .then((doc) => {
        if (!doc.data().contacts) return;
        this._asyncRequest = null;

        this.setState({ contactsList: doc.data().contacts.reverse() });
      })
      .catch((err) => {
        this.setState({ contactsList: [] });
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
  toggleModalEdit() {
    this.setState((prevState) => {
      return {
        ...prevState,
        modalEditOpen: !prevState.modalEditOpen,
      };
    });
  }
  setEditModelInputValues(item) {
    this.setState({
      name: item.name,
      isKnowsAboutUs: false,
      age: item.age,
      gender: item.gender,
      discount: item.discount,
      email: item.email,
      event: item.event || [{}],
      medicalHistory: item.medicalHistory,
      notes: item.notes,
      phone: item.phone,
      riderTag: item.riderTag || [],
      ridingEx: { label: item.ridingEx, value: item.ridingEx } || {},
      ridingExNotes: item.ridingExNotes || "",
      whatsapp: item.whatsapp || "",
      whereKnowUs: { label: item.whereKnowUs, value: item.whereKnowUs } || {},
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
      age: "",
      gender: "",
      discount: 0,
      email: "",
      event: [{}],
      medicalHistory: "",
      name: "",
      notes: "",
      paymentMethod: {},
      phone: "",
      riderTag: [],
      ridingEx: {},
      ridingExNotes: "",
      whatsapp: "",
      whereKnowUs: {},
      isCar: false,
      isBreakfast: false,
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
      contactsList,
      gender,
      isCar,
      isBreakfast,
    } = this.state;
    //Obligator: name, event, phone, whatsapp, discount
    const id = contactsList.length ? contactsList[0].id + 1 : 0;

    const item = {
      name: name,
      event: [event.value || ""],
      phone: phone,
      whatsapp: whatsapp,
      discount: discount,
      email: email,
      age: age,
      gender: gender,
      medicalHistory: medicalHistory,
      ridingEx: ridingEx.value || "",
      ridingExNotes: ridingExNotes,
      whereKnowUs: whereKnowUs.value || "",
      riderTag: riderTag || [{ label: "", value: "", key: "" }],
      notes: notes,
      isKnowsAboutUs: isKnowsAboutUs,
      isCar: isCar,
      isBreakfast: isBreakfast,
      id: id,
      creationDate: new Date(),
      createdBy: localStorage.getItem("user_id"),
    };

    if (!name || !phone || !gender) {
      this.setState({ isError: true });
      return;
    }
    console.log("Contact's DATA", item);
    docRef
      .update({
        contacts: firebase.firestore.FieldValue.arrayUnion(item),
      })
      .then(() => {
        this.setRidersList();
        this.notification("You have successfully created a new contact!");
        this.cleanModelState();
        this.toggleModal();
        console.log(item);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  addBatch() {
    let batchText = this.state.bulkText;
    if(!batchText.includes("*")||!batchText.includes("/")){
      this.setState({isError: true})
      return;
    }
    let arrObj = [];
    const { contactsList } = this.state;
    let id = contactsList.length ? contactsList[0].id + 1 : 0;
    batchText.trim().replace(/[\n\r]+/g, "");
    const newArr = batchText.split("*");

    for (let i = 0; i < newArr.length; i++) {
      let arr = newArr[i].trim().split("/");
      arrObj.push({
        age: "",
        createdBy: localStorage.getItem("user_id"),
        creationDate: new Date(),
        discount: 0,
        email: "",
        event: [""],
        gender: arr[2] === "M" ? "male" : "female",
        id: id,
        isBreakfast: false,
        isCar: false,
        isKnowsAboutUs: false,
        medicalHistory: "",
        name: arr[0] || "",
        notes: "",
        phone: arr[1] || "",
        riderTag: [],
        ridingEx: "",
        ridingExNotes: "",
        whatsapp: arr[3] || "",
        whereKnowUs: "",
      });
      console.log(arr);
      id++;
    }
    console.log(arrObj);

    docRef
      .update({
        contacts: firebase.firestore.FieldValue.arrayUnion.apply(null, arrObj),
      })
      .then(() => {
        this.notification("You have successfully added a bulk of elements!");
        this.setRidersList();
        this.cleanModelState();
        this.toggleModal();
      })
      .catch((e) => {
        console.log(e);
      });
  }
  deletePost(id) {
    const item = this.state.contactsList.filter((e) => e.id === id)[0];
    docRef
      .update({
        contacts: firebase.firestore.FieldValue.arrayRemove(item),
      })
      .then(() => {
        this.notification("You have successfully deleted " + item.name + " !");
        this.setRidersList();
      })
      .catch((e) => {
        console.log(e);
      });
  }
  editPost() {
    const id = this.state.editPostId;
    const olditem = this.state.contactsList.filter((e) => e.id === id)[0];

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
      riderTag,
      notes,
      isKnowsAboutUs,
      contactsList,
      gender,
      isCar,
      isBreakfast,
    } = this.state;

    const item = {
      name: name,
      event: [event.value || ""],
      phone: phone,
      whatsapp: whatsapp,
      discount: discount,
      email: email,
      age: age,
      gender: gender,
      medicalHistory: medicalHistory,
      ridingEx: ridingEx.value || "",
      ridingExNotes: ridingExNotes,
      whereKnowUs: whereKnowUs.value || "",
      riderTag: riderTag || [{ label: "", value: "", key: "" }],
      notes: notes,
      isKnowsAboutUs: isKnowsAboutUs,
      id: olditem.id,
      creationDate: olditem.creationDate,
      lastEdited: new Date(),
      createdBy: olditem.createdBy,
    };

    docRef
      .update({
        contacts: firebase.firestore.FieldValue.arrayRemove(olditem),
      })
      .then(() => {
        docRef
          .update({
            contacts: firebase.firestore.FieldValue.arrayUnion(item),
          })
          .then(() => {
            this.notification("You have edited " + item.name + " !");
            this.setContactsList();
            this.toggleModalEdit();
          })
          .catch((e) => console.log(e));
      })
      .catch(() => {
        this.notification("ERRRRROOOOR");
      });
  }
  handleKeyPress(e) {
    if (e.key === "Enter") {
      this.setState({ searchKeyword: e.target.value });
      console.log(this.state.searchKeyword, "--value ", e.target.value);
    }
  }
  handleOnChangeInput(e, name = "") {
    this.setState({ searchKeyword: e.target.value });
    console.log(name, "--value ", e.target.value);
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
  notification(message = "Something Happened!", title = "", style = "filled") {
    NotificationManager.success(message, title, 3000, null, null, style);
  }
  handleChangeMulti = (riderTag) => {
    this.setState({ riderTag });
  };
  toggleSmall() {
    this.setState({
      modalSmall: !this.state.modalSmall,
    });
  }

  render() {
    const { contactsList, isError } = this.state;

    const ridingEx = [
      { label: "Beginner", value: "Beginner" },
      { label: "Normal", value: "Normal" },
      { label: "Hard", value: "Hard" },
    ];
    const whereKnowUs = [
      { label: "Facebook", value: "Facebook" },
      { label: "Instagram", value: "Instagram" },
      { label: "Website", value: "Website" },
      { label: "Friend", value: "Friend" },
      { label: "Other", value: "Other" },
    ];
    const SELECT_DATA = [
      { label: "Covid", value: "covid", key: 0 },
      { label: "Byfasel", value: "Byfasel", key: 1 },
      { label: "Byhlek el 5el", value: "Byhlek el 5el", key: 2 },
    ];
    return (
      <Fragment>
        <Row className="app-row survey-app pr-0">
          <Colxx xxs="12">
            <div className="mb-2">
              <h1>
                <IntlMessages id="menu.contacts" />
              </h1>

              <div className="float-sm-right">
                <Button
                  color="primary"
                  outline="light"
                  size="lg"
                  className="top-right-button mr-1 px-4"
                  onClick={() => this.toggleModal()}
                >
                  <IntlMessages id="Add New Contact" />
                </Button>
                <Modal
                  isOpen={this.state.modalOpen}
                  toggle={() => this.toggleModal()}
                  wrapClassName="modal-right"
                  // backdrop={true}
                >
                  <ModalHeader toggle={() => this.toggleModal()}>
                    <IntlMessages id="Add New Contact" />
                  </ModalHeader>
                  <ModalBody>
                    <Label className="mt-4">
                      <IntlMessages id="Bulk" />
                    </Label>
                    <Switch
                      className="custom-switch custom-switch-primary"
                      checked={this.state.switchCheckedPrimary}
                      onChange={(switchCheckedPrimary) => {
                        this.setState({ switchCheckedPrimary });
                      }}
                    />

                    {!this.state.switchCheckedPrimary ? (
                      <Fragment>
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
                          <IntlMessages id="Phone Number *" />
                        </Label>
                        <Input
                          type="tel"
                          defaultValue={this.state.phone}
                          onChange={(event) => {
                            this.setState({ phone: event.target.value });
                          }}
                        />

                        <Label className="mt-4" for="exCustomRadio">
                          <IntlMessages id="Gender *" />
                        </Label>

                        <CustomInput
                          type="radio"
                          id="exCustomRadio"
                          name="customRadio"
                          label="Male ♂"
                          onChange={() => this.setState({ gender: "male" })}
                        />
                        <CustomInput
                          type="radio"
                          id="exCustomRadio2"
                          name="customRadio"
                          label="Female ♀"
                          onChange={() => this.setState({ gender: "female" })}
                        />

                        <Separator className="mt-5 mb-5" />

                        <Label className="mt-4">
                          <IntlMessages id="Whatsapp Number" />
                        </Label>
                        <Input
                          type="tel"
                          defaultValue={this.state.whatsapp}
                          onChange={(event) => {
                            this.setState({ whatsapp: event.target.value });
                          }}
                        />
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
                        <Separator className="mt-5 mb-5" />

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
                      </Fragment>
                    ) : (
                      <Fragment>
                        <Label className="mt-4">
                          <IntlMessages id="Bulk" />
                        </Label>
                        <Input
                          height="150px"
                          type="textarea"
                          defaultValue={this.state.bulkText}
                          onChange={(event) => {
                            this.setState({
                              bulkText: event.target.value,
                              isError: false,
                            });
                          }}
                        />
                      </Fragment>
                    )}
                  </ModalBody>
                  {isError && (
                    <p className="text-danger text-center">
                      Check your data and try again!
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
                      onClick={() => !this.state.switchCheckedPrimary?this.addPost():this.addBatch()}
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
                    this.cleanModelState();
                  }}
                  wrapClassName="modal-right"
                  // backdrop={true}
                >
                  <ModalHeader
                    toggle={() => {
                      this.toggleModalEdit();
                      this.cleanModelState();
                    }}
                  >
                    <IntlMessages id="Edit Contact" />
                  </ModalHeader>
                  <ModalBody>
                    <Label className="mt-4">
                      <IntlMessages id="Name *" />
                    </Label>
                    <Input
                      type="text"
                      defaultValue={this.state.name}
                      onChange={(event) => {
                        this.setState({
                          name: event.target.value,
                        });
                      }}
                    />
                    <Label className="mt-4">
                      <IntlMessages id="Phone Number *" />
                    </Label>
                    <Input
                      type="tel"
                      defaultValue={this.state.phone}
                      onChange={(event) => {
                        this.setState({
                          phone: event.target.value,
                        });
                      }}
                    />

                    <Label className="mt-4" for="exCustomRadio">
                      <IntlMessages id="Gender *" />
                    </Label>

                    <CustomInput
                      type="radio"
                      id="exCustomRadio"
                      name="customRadio"
                      label="Male ♂"
                      checked={this.state.gender === "male"}
                      onChange={() => this.setState({ gender: "male" })}
                    />
                    <CustomInput
                      type="radio"
                      id="exCustomRadio2"
                      name="customRadio"
                      label="Female ♀"
                      checked={this.state.gender === "female"}
                      onChange={() => this.setState({ gender: "female" })}
                    />

                    <Separator className="mt-5 mb-5" />

                    <Label className="mt-4">
                      <IntlMessages id="Whatsapp Number" />
                    </Label>
                    <Input
                      type="tel"
                      defaultValue={this.state.whatsapp}
                      onChange={(event) => {
                        this.setState({
                          whatsapp: event.target.value,
                        });
                      }}
                    />
                    <Label className="mt-4">
                      <IntlMessages id="Email" />
                    </Label>
                    <Input
                      type="email"
                      defaultValue={this.state.email}
                      onChange={(event) => {
                        this.setState({
                          email: event.target.value,
                        });
                      }}
                    />

                    <Label className="mt-4">
                      <IntlMessages id="Age" />
                    </Label>
                    <Input
                      type="number"
                      defaultValue={this.state.age}
                      onChange={(event) => {
                        this.setState({
                          age: event.target.value,
                        });
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
                    <Separator className="mt-5 mb-5" />

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
                        return {
                          label: x.label,
                          value: x.value,
                          key: i,
                        };
                      })}
                      value={this.state.ridingEx}
                      onChange={(val) => {
                        this.setState({
                          ridingEx: val,
                          isError: false,
                        });
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
                        this.setState({
                          whereKnowUs: val,
                          isError: false,
                        });
                      }}
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
                      Obligatory fields must be filled!
                    </p>
                  )}
                  <ModalFooter>
                    <Button
                      color="danger"
                      outline
                      onClick={() => {
                        this.toggleModalEdit();
                        this.cleanModelState();
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

            <div className="mb-2">
              {/* <Button onClick={() => this.addBatch()}>TEST</Button> */}
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
            <div className="mb-2">
              <Button
                color="empty"
                id="displayOptions"
                className="pt-0 pl-0 d-inline-block d-md-none"
                onClick={() => this.toggleDisplayOptions()}
              >
                <IntlMessages id="todo.display-options" />{" "}
                <i className="simple-icon-arrow-down align-middle" />
              </Button>
              <Collapse
                className="d-md-block"
                isOpen={this.state.displayOptionsIsOpen}
              >
                <div className="d-block mb-2 d-md-inline-block">
                  {/* <UncontrolledDropdown className="mr-1 float-md-left btn-group mb-1">
                    <DropdownToggle caret color="outline-dark" size="xs">
                      <IntlMessages id="todo.orderby" />
                      {"orderColumn.label"}
                    </DropdownToggle>
                    <DropdownMenu>
                     
                          <DropdownItem
                            onClick={console.log(
                              "change order by name"
                            )}
                          >
                           Name
                          </DropdownItem>
                       
                    </DropdownMenu>
                  </UncontrolledDropdown> */}
                  <div className="search-sm d-inline-block float-md-left mr-1 mb-1 align-top">
                    <input
                      type="text"
                      name="keyword"
                      id="search"
                      placeholder={"Search..."}
                      defaultValue={this.state.searchKeyword}
                      onChange={(e) => this.handleOnChangeInput(e)}
                      onKeyPress={(e) => this.handleKeyPress(e)}
                    />
                  </div>
                </div>
              </Collapse>
            </div>
            <Separator className="mb-5" />

            <Row>
              {contactsList ? (
                contactsList.map((item, index) => {
                  return item.name
                    .toUpperCase()
                    .includes(this.state.searchKeyword.toUpperCase()) ? (
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
                                onClick={() => console.log(item)}
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
                            <div
                              className=" custom-checkbox pl-1 align-self-center pr-4"
                              style={{ display: "inline-flex" }}
                            >
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
                                  console.log(item);
                                  this.setEditModelInputValues(item);
                                  this.toggleModalEdit();
                                  this.setState({ editPostId: item.id });
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
                  ) : (
                    <Fragment></Fragment>
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

export default Contacts;
