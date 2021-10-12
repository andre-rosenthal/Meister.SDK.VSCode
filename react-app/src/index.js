//import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
//import got from 'got';

import React, { Component } from 'react'

export default class App extends Component {
  
  componentDidMount() {
    window.addEventListener('message', event => {

      const message = event.data; 
      switch (message.command) {
        case 'connected':
          this.setState({ saveVisible: true });
          return;
        case 'saved':
          this.setState({ saveVisible: false });
          this.setState({ editVisible: true });
          return;
        case 'edit': 
          this.setState({ saveVisible: false });
          this.setState({ editVisible: false });
          return;
        case 'exists':
          this.setState({ saveVisible: false });
          this.setState({ editVisible: false });
          return;
      }
    });
  }

  constructor(props) {
    super(props);
    //this.saveVisible = false;
    this.vscode = acquireVsCodeApi();
    this.state = { connectionName: 'Sonol', gateway: 'sgate.sonol.co.il', protocol: 'https', cNumber: '100', uid: 'AROSENTHAL', password: 'Pa55word.', saveVisible:false, editVisible:false };
  }

  connect() {
    if (this.state.protocol && this.state.gateway && this.state.cNumber && this.state.uid && this.state.password) {
      const url = "https://localhost:3005/api/Meister/Login/" + this.state.protocol + "/" + this.state.gateway + "/" + this.state.cNumber;
      const authorization = 'Basic' + ' ' + btoa(this.state.uid + ':' + this.state.password);
      this.vscode.postMessage({ command: 'connect', url: url, authorization: authorization, connection: this.state });
    }
    else {
      this.vscode.postMessage({ command: 'emptyFields' });
    }
  }

  updateProtocol(e) {
    this.setState({ protocol: e.target.value })
  }

  save() {
    this.vscode.postMessage({ command: 'save', data: this.state });
  }

  edit() {
    this.vscode.postMessage({command:'edit'})
  }

  render() {
    return (
      <div>
        <label for="connectionName">
          <b> enter the name of the connection</b>
        </label>
        <br />
        <input onChange={(e) => this.setState({ connectionName: e.target.value })} type="text" value={this.state.connectionName} id="connectionName" name="connectionName" />
        <br />
        <label for="protocol">
          <b>Select the Protocol</b>
        </label>
        <br />
        <input onChange={(e) => this.updateProtocol(e)} checked={this.state.protocol === 'https'} type="radio" value="https" id="https" name="protocol" />
        <label for="https">
          <b>Https</b>
        </label>
        <br />
        <input onChange={(e) => this.updateProtocol(e)} checked={this.state.protocol === 'http'} type="radio" value="http" id="http" name="protocol" />
        <label for="http">
          <b>Http</b>
        </label>
        <br />
        <label for="gateway">
          <b> enter the URL for the SAP Gateway System (as server.com:port or server.com:port )</b>
        </label>
        <br />
        <input onChange={(e) => this.setState({ gateway: e.target.value })} type="text" value={this.state.gateway} id="gateway" name="gateway" />
        <br />
        <label for="clientNumber" >
          <b>Please enter the client number</b>
        </label>
        <br />
        <input onChange={(e) => this.setState({ cNumber: e.target.value })} type="text" value={this.state.cNumber} id="clientNumber" name="clientNumber" />
        <br />

        <label for="sapUserId" >
          <b>Please enter the SAP UserId </b>
        </label>
        <br />
        <input onChange={(e) => this.setState({ uid: e.target.value })} type="text" value={this.state.uid} id="sapUserId" name="sapUserId" />
        <br />
        <label for="password" >
          <b>Lastly Please enter the SAP  UserId Password</b>
        </label>
        <br />
        <input onChange={(e) => this.setState({ password: e.target.value })} type="password" id="password" value={this.state.password} name="password" />
        <br />
        <button onClick={() => this.connect()} id="test">Test connection</button>
        <button onClick={() => this.save()} style={{ visibility: this.state.saveVisible ? 'visible' : 'hidden' }} id="save">save</button>
        <button onClick={() => this.edit()} style={{ visibility: this.state.editVisible ? 'visible' : 'hidden' }} id="edit">edit</button>
      </div>
    )
  }
}






ReactDOM.render(<App />, document.getElementById("root"));

