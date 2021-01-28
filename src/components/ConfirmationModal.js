import React, { Component } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

export default class ConfirmationModal extends Component {
  state = { modalSmall: false };
  toggleSmall() {
    this.setState({
      modalSmall: !this.state.modalSmall,
    });
  }
  render() {
    return (
      <div>
        <div
        //   className="mb-2"
        //   color="primary"
        //   outline
          onClick={() => this.toggleSmall()}
        >
          {this.props.button}
        </div>
        <Modal
          isOpen={this.state.modalSmall}
          size="sm"
          toggle={() => this.toggleSmall()}
        >
          <ModalHeader toggle={() => this.toggleSmall()}>
            Are you sure?
          </ModalHeader>
          {/* <ModalBody>---</ModalBody> */}
          <ModalFooter>
            <Button
              outline="light"
              onClick={() => {
                this.props.action();
                this.toggleSmall();
              }}
            >
              Yes, Sure!
            </Button>{" "}
            <Button color="danger" onClick={() => this.toggleSmall()}>
              No
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}
