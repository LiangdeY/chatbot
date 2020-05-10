import React from 'react';
import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom'
import StudentView from './Rout/StudentView';
import TeachingStaffView from './Rout/TeachingStaffView';

class Login extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        password: '',
        unikey: '',
        user:{},
        redirect: false 
      };
      this.handleInputChange  = this.handleInputChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);    
    };
    //save the unikey andthe password to the state
    handleInputChange (event) {
        const target = event.target;
        const name = target.name;
        const value = target.value;

        this.setState({
            [name]: value
        });   
    };
    //send a post reqest to the backend code and get respond from the database
    handleSubmit(event) {
      event.preventDefault();

      fetch('/login', { 
        method: 'POST',
        headers: {
          'Accept': 'application/json', 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          unikey: this.state.unikey,
          password: this.state.password
        })
      }).then(response => response.json())
      .then(body=>{

        try{
          
          if(body.isSuccess){
            console.log(body.user);
            this.setState({
              redirect: true,
              user: body.user
            });
          }
          else{
            alert('Unikey or password invalid');
          }
        }
        catch(e){
          console.log(e); 
        }
      });
    };
 
    render() {   
      if(this.state.redirect){
        console.log(this.state.user);

        if(this.state.user.IsStudent == '1'){
          console.log('yo2');
          return(
            <Router>
              <Route path="/StudentView" exact strict render ={
                () => {
                    return (
                      <div>
                        <StudentView user={this.state.user} />
                      </div>
                    )}} 
              />
             <Redirect to='/StudentView'  />
            </Router>
          )
        }
        else if(this.state.user.IsStudent == '0'){
          return(
            <Router>
              <Route path="/TeachingStaffView" exact strict render ={
                () => {
                    return (
                      <div>
                        <TeachingStaffView user={this.state.user} />
                      </div>
                    )}} 
              />

             <Redirect to='/TeachingStaffView'  />
            </Router>
          )        
        }
      }
      
      return (
        <div>
          <form onSubmit={this.handleSubmit}>
            <input 
              type="text" 
              value={this.state.unikey}   
              onChange={this.handleInputChange } 
              placeholder="Unikey" 
              name="unikey"
              />

            <input 
              type="password"
              value={this.state.password}   
              onChange={this.handleInputChange } 
              placeholder="password" 
              name="password"
              />
          
            <button type="submit">Log in </button>

          </form>
        </div>   
      );
    };
  };
  export default Login;