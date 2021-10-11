//import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
//import got from 'got';

import React, { Component } from 'react'

export default class App extends Component {
  
  constructor(props) {
    super(props);
    this.vscode = acquireVsCodeApi();
    this.state = { gateway: 'sgate.sonol.co.il', protocol: 'https', cNumber: '100', uid: 'AROSENTHAL', password: 'Pa55word.'};
  }
 
  connect() {
    if (this.state.protocol && this.state.gateway && this.state.cNumber && this.state.uid && this.state.password) {
      const url = "https://localhost:3005/api/Meister/Login/" + this.state.protocol + "/" + this.state.gateway + "/" + this.state.cNumber;
      const authorization = 'Basic' + ' ' + btoa(this.state.uid + ':' + this.state.password);
      this.vscode.postMessage({ command: 'connect', url: url, authorization: authorization });
    }
    else {
      this.vscode.postMessage({ command: 'emptyFields' });
    }
  }

  updateProtocol(e) {
   this.setState({protocol: e.target.value})
  }
  // this.setState({ protocol: e.target.value, httpsChecked: false })
  render() {
    return (
      <div>
        <label for="protocol">
          <b>Select the Protocol</b>
        </label>
        <br />
        <input onChange={(e) => this.updateProtocol(e) } checked={this.state.protocol==='https'} type="radio" value="https"  id="https" name="protocol" />
        <label for="https">
          <b>Https</b>
        </label>
        <br />
        <input onChange={(e) => this.updateProtocol(e)}  checked={this.state.protocol==='http'} type="radio" value="http" id="http" name="protocol" />
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

      </div>
    )
  }
}


// export default function App() {
//   const vscode = acquireVsCodeApi();
//   const [protocol, setProtocol] = useState('https');
//   const [gateway, setGateway] = useState("sgate.sonol.co.il")
//   const [cNumber, setCNumber] = useState('100')
//   const [uid, setUid] = useState('AROSENTHAL')
//   const [password, setPassword] = useState('Pa55word.')

//   function change(value) {
//     console.log(value);

//     setGateway(value)
//   }
//   // onClick = {(e) => setProtocol(e.target.value)}
//   return (
      
//     )
// }



ReactDOM.render(<App />, document.getElementById("root"));

