import React, { Component, Fragment } from "react";
import IntlMessages from "Util/IntlMessages";
import { injectIntl } from "react-intl";
import QrScanner from "qr-scanner";

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
  Alert,
  UncontrolledAlert,
} from "reactstrap";
import ConfirmationModal from "Components/ConfirmationModal";
import Select from "react-select";
import CustomSelectInput from "Components/CustomSelectInput";

import { Colxx, Separator } from "Components/CustomBootstrap";
import { NavLink } from "react-router-dom";

import firebase from "firebase";
import { db } from "../../firebase";
import { NotificationManager } from "Components/ReactNotifications";
const docRef = db.collection("app").doc("postBank");
let timer;

class QrReader extends Component {
  state = {
    visible: true,

    postData: null,
    dropdownSplitOpen: false,
    lastChecked: null,
    displayOptionsIsOpen: false,
    errorMessage: null,
    isCopied: false,
    //Modal
    modalOpen: false,
    title: "",
    label: {},
    category: {},
    status: "ACTIVE",
  };
  componentDidMount() {
    const video = document.getElementById("qr-video");
    const videoContainer = document.getElementById("video-container");
    const camHasCamera = document.getElementById("cam-has-camera");
    const camList = document.getElementById("cam-list");
    const camHasFlash = document.getElementById("cam-has-flash");
    const flashToggle = document.getElementById("flash-toggle");
    const flashState = document.getElementById("flash-state");
    const camQrResult = document.getElementById("cam-qr-result");
    const camQrResultTimestamp = document.getElementById(
      "cam-qr-result-timestamp"
    );
    const fileSelector = document.getElementById("file-selector");
    const fileQrResult = document.getElementById("file-qr-result");

    function setResult(label, result) {
      console.log(result.data);
      label.textContent = result.data;
      camQrResultTimestamp.textContent = new Date().toString();
      label.style.color = "teal";
      clearTimeout(label.highlightTimeout);
      label.highlightTimeout = setTimeout(
        () => (label.style.color = "inherit"),
        100
      );
    }

    // ####### Web Cam Scanning #######

    const scanner = new QrScanner(
      video,
      (result) => setResult(camQrResult, result),
      {
        onDecodeError: (error) => {
          camQrResult.textContent = error;
          camQrResult.style.color = "inherit";
        },
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    const updateFlashAvailability = () => {
      scanner.hasFlash().then((hasFlash) => {
        camHasFlash.textContent = hasFlash;
        flashToggle.style.display = hasFlash ? "inline-block" : "none";
      });
    };

    scanner.start().then(() => {
      updateFlashAvailability();
      // List cameras after the scanner started to avoid listCamera's stream and the scanner's stream being requested
      // at the same time which can result in listCamera's unconstrained stream also being offered to the scanner.
      // Note that we can also start the scanner after listCameras, we just have it this way around in the demo to
      // start the scanner earlier.
      QrScanner.listCameras(true).then((cameras) =>
        cameras.forEach((camera) => {
          const option = document.createElement("option");
          option.value = camera.id;
          option.text = camera.label;
          camList.add(option);
        })
      );
    });

    QrScanner.hasCamera().then(
      (hasCamera) => (camHasCamera.textContent = hasCamera)
    );

    // for debugging
    window.scanner = scanner;

    document
      .getElementById("scan-region-highlight-style-select")
      .addEventListener("change", (e) => {
        videoContainer.className = e.target.value;
        scanner._updateOverlay(); // reposition the highlight because style 2 sets position: relative
      });

    document
      .getElementById("show-scan-region")
      .addEventListener("change", (e) => {
        const input = e.target;
        const label = input.parentNode;
        label.parentNode.insertBefore(scanner.$canvas, label.nextSibling);
        scanner.$canvas.style.display = input.checked ? "block" : "none";
      });

    document
      .getElementById("inversion-mode-select")
      .addEventListener("change", (event) => {
        scanner.setInversionMode(event.target.value);
      });

    camList.addEventListener("change", (event) => {
      scanner.setCamera(event.target.value).then(updateFlashAvailability);
    });

    flashToggle.addEventListener("click", () => {
      scanner
        .toggleFlash()
        .then(
          () => (flashState.textContent = scanner.isFlashOn() ? "on" : "off")
        );
    });

    document.getElementById("start-button").addEventListener("click", () => {
      scanner.start();
    });

    document.getElementById("stop-button").addEventListener("click", () => {
      scanner.stop();
    });

    // ####### File Scanning #######

    fileSelector.addEventListener("change", (event) => {
      const file = fileSelector.files[0];
      if (!file) {
        return;
      }
      QrScanner.scanImage(file, { returnDetailedScanResult: true })
        .then((result) => setResult(fileQrResult, result))
        .catch((e) =>
          setResult(fileQrResult, { data: e || "No QR code found." })
        );
    });

    this.setPostsList();
  }

  componentWillUnmount() {
    if (this._asyncRequest) {
      this._asyncRequest.cancel();
    }
  }
  onDismiss() {
    this.setState({ visible: false });
  }
  setPostsList = () => {
    this._asyncRequest = docRef.get().then((doc) => {
      if (!doc.data().posts) return;
      this._asyncRequest = null;

      this.setState({ postData: doc.data().posts });
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
    const { title, category, detail, label, postData } = this.state;

    if (
      Object.keys(category).length === 0 ||
      !detail.length ||
      Object.keys(label).length === 0
    ) {
      this.setState({ isError: true });
      return;
    }

    const id = postData.length ? postData[0].id + 1 : 0,
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
        posts: firebase.firestore.FieldValue.arrayUnion(item),
      })
      .then(() => {
        this.setPostsList();
        this.notification("You have successfully created a new post!");
        this.cleanModelState();
        this.toggleModal();
      })
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

    this.notification("Copied To ClipBoard!");
    document.body.removeChild(dummy);
  }
  notification(message = "Something Happened!", title = "", style = "filled") {
    NotificationManager.success(message, title, 3000, null, null, style);
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
    const { postData, isCopied, fadeClass, errorMessage, isError } = this.state;

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
                <IntlMessages id="menu.qrReader" />
              </h1>

              <div className="float-sm-right">
                <Button
                  color="primary"
                  outline="light"
                  size="lg"
                  className="top-right-button mr-1"
                  onClick={() => this.toggleModal()}
                >
                  <IntlMessages id="Add New Post" />
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
              <Colxx xxs="12">
                <Card className="card d-flex mb-3">
                  <div className="d-flex flex-grow-1 min-width-zero">
                    <CardBody className="align-self-center d-flex flex-column flex-md-row justify-content-between min-width-zero align-items-md-center">
                      <Colxx xxs="12">
                        <Row>
                          <h1>Scan from WebCam:</h1>
                        </Row>

                        <Row>
                          <div id="video-container">
                            <video id="qr-video"></video>
                          </div>
                        </Row>
                        <Row>
                          <div>
                            <label>
                              Highlight Style
                              <select id="scan-region-highlight-style-select">
                                <option value="default-style">
                                  Default style
                                </option>
                                <option value="example-style-1">
                                  Example custom style 1
                                </option>
                                <option value="example-style-2">
                                  Example custom style 2
                                </option>
                              </select>
                            </label>
                            <label>
                              <input id="show-scan-region" type="checkbox" />
                              Show scan region canvas
                            </label>
                          </div>
                        </Row>
                        <Row>
                          <div>
                            <select id="inversion-mode-select">
                              <option value="original">
                                Scan original (dark QR code on bright
                                background)
                              </option>
                              <option value="invert">
                                Scan with inverted colors (bright QR code on
                                dark background)
                              </option>
                              <option value="both">Scan both</option>
                            </select>
                            <br />
                          </div>
                        </Row>
                        <Row>
                          <br />
                          <b>Device has camera: </b>
                          <span id="cam-has-camera"></span>
                        </Row>
                        <Row>
                          <div>
                            <br />
                            <b>Preferred camera:</b>
                            <select id="cam-list">
                              <option value="environment" selected>
                                Environment Facing (default)
                              </option>
                              <option value="user">User Facing</option>
                            </select>
                          </div>
                        </Row>
                        <Row>
                          <br />
                          <b>Camera has flash: </b>
                          <span id="cam-has-flash"></span>
                          <div>
                            <button id="flash-toggle">
                              📸 Flash: <span id="flash-state">off</span>
                            </button>
                          </div>
                        </Row>
                        <br />
                        <Row>
                          <b>Detected QR code: </b>
                        </Row>
                        <Row>
                          <span id="cam-qr-result">None</span>
                          <br />
                        </Row>
                        <Row>
                          <b>Last detected at: </b>
                          <span id="cam-qr-result-timestamp"></span>
                          <button id="start-button">Start</button>
                          <button id="stop-button">Stop</button>
                          <br />
                        </Row>
                        <Row>
                          <h1>Scan from File:</h1>
                          <input type="file" id="file-selector" />
                        </Row>
                        <br />
                        <Row>
                          <b>Detected QR code: </b>
                          <span id="file-qr-result">None</span>
                        </Row>
                      </Colxx>
                    </CardBody>
                  </div>
                </Card>
              </Colxx>
            </Row>
            {/* {isCopied ? (
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
            ) : null} */}
          </Colxx>

          {/* <Colxx xxs="12">
            <Card className="mb-4">
              <CardBody>
                <CardTitle>
                  <IntlMessages id="alert.react-notifications" />
                </CardTitle>

                <CardSubtitle>
                  <IntlMessages id="alert.filled" />
                </CardSubtitle>

                <Button
                  className="mb-3"
                  color="success"
                  onClick={this.createNotification("success", "filled")}
                >
                  <IntlMessages id="alert.success" />
                </Button>{" "}


              </CardBody>
            </Card>


          </Colxx> */}
        </Row>
      </Fragment>
    );
  }
}

export default QrReader;
