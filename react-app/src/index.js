//import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
//import got from 'got';

import React, { Component } from 'react'
import { v4 as uuidv4 } from 'uuid';
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
        case 'edited':
          this.setState({ saveChangesVisible: false });
          this.setState({ editVisible: true });
          return;
        case 'exists':
          this.setState({ saveVisible: false });
          this.setState({ editVisible: false });
          return;
        case 'connectedAgain':
          this.setState({ saveChangesVisible: true, editVisible: false, onEdit: false });
          return;
        case 'open webview':
          this.setState(message.details);
          return;
      }
    });
  }

  constructor(props) {
    super(props);
    //this.saveVisible = false;
    this.vscode = acquireVsCodeApi();
    this.state = {
      connectionId: uuidv4(),
      connectionName: 'Sonol',
      gateway: 'sgate.sonol.co.il',
      protocol: 'https',
      cNumber: '100',
      uid: 'AROSENTHAL',
      password: 'Pa55word.',
      saveVisible: false,
      editVisible: false,
      certFolder: 'C:/Users/rachelg/source/repos/Meister.UserManagment/Meister.UserManagement/middleware/cert',
      certInputVisible: false,
      saveChangesVisible: false,
      onEdit:false
    };
  }

  connect(again=false) {
    if (this.state.protocol && this.state.gateway && this.state.cNumber && this.state.uid && this.state.password&&this.state.certFolder) {
      const url = "http://localhost:3005/api/Meister/Login";
      const authorization = 'Basic' + ' ' + btoa(this.state.uid + ':' + this.state.password);
      const body = {
        isHttps: this.state.protocol === 'https',
        certFolder: this.state.certFolder,
        gateway: this.state.gateway,
        client: this.state.cNumber
      };
     
      this.vscode.postMessage({ command: 'connect', url: url, authorization: authorization, body: JSON.stringify(body), again });
      
    }
    else {
      this.vscode.postMessage({ command: 'emptyFields' });
    }
  }

  updateProtocol(e) {
    this.setState({ protocol: e.target.value })
    if (e.target.value === 'http') {
      this.setState({ certInputVisible: false })
    }
  }

  save() {
    this.vscode.postMessage({ command: 'save', data: this.state });
  }

  edit() {
    this.vscode.postMessage({ command: 'edit', data: this.state })
  }

  loadCert() {
    this.setState({ certInputVisible: true });
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
        <input onClick={() => this.loadCert()} type="image" src={'https://www.svgrepo.com/show/113465/certificate.svg'} style={{ width: '10%', display: this.state.protocol === 'https' ? 'block' : 'none' }} />
        <div style={{ display: this.state.certInputVisible ? 'block' : 'none' }}>
          
          <label for="certInput" >
            <b>
              Enter the path of the cert folder
            </b>
          </label>
         <br/>
          <input onChange={(e) => this.setState({ certFolder: e.target.value })} type="text" id="certInput" style={{ width: "100%" }} value={ this.state.certFolder}/>
        </div>
       
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
          <button onClick={() => this.connect(this.state.onEdit)} id="test">Test connection</button>
          <button onClick={() => this.save()} style={{ display: this.state.saveVisible ? 'block' : 'none' }} id="save">save</button>
        <button onClick={() => this.setState({editVisible:false, onEdit:true})} style={{ display: this.state.editVisible ? 'block' : 'none' }} id="edit">edit</button>
        <button onClick={() => this.edit()} style={{ display: this.state.saveChangesVisible ? 'block' : 'none' }} id="saveChanges">save changes</button>
      </div>
    )
  }
}






ReactDOM.render(<App />, document.getElementById("root"));

