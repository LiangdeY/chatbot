import React, { Component } from 'react';
import axios from "axios";


export default class Test extends Component {
    constructor() {
        super();
        this.state = {
            intent: 'fails receiving from backend'
        };
    }

    componentDidMount = () => {
        console.log('yo');

        axios.get("/testFrontEnd").then(response => {
            this.setState({
                intent: response.data
            });
        });
    };

    render() {
        return (
            <div>
                <h1> The intent that is being called is : {this.state.intent} </h1>
            </div>
        )    
    }
}