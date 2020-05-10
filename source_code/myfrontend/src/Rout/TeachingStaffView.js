import React from 'react';
import '../App.css';

export default class TeachingStaffView extends React.Component {
    render(){
        console.log(this.props.user.Name);
        return (
          <header>
            <h1> Teaching Staff View </h1>
            <h2>Hello {this.props.user.Name}</h2>
          </header>
        );
    }
}

