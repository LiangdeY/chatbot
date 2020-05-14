import React from 'react';
import '../App.css';
import {BrowserRouter as Router, Route, Redirect} from 'react-router-dom'
import Login from '../Login';

export default class TeachingStaffView extends React.Component {
  constructor(props) {
    super(props);
    //have an array of logs, contains date and obeject
    this.state = {
        data:[],
        redirect: false
      }
   
  }
  handleOnClick = () => {
    this.setState({ redirect: true });
    console.log(this.state.redirect = true);
  }

    componentDidMount = () => {
      //fetch all the logs belong to the courseCode of this teaching staff
      fetch('/teachingStaffLogs', { 
          method: 'POST',
          headers: {
            'Accept': 'application/json', 
            'Content-Type': 'application/json' 
          },
          //get the course of this teaching staff
          body: JSON.stringify({
            courseCode: this.props.user.CourseCode
          })
      })
      .then(response => response.json())
        .then(body=>{
          try{
            if(body.isSuccess){

              let LogsByDayKey = [];

              for(let i = 0; i < body.logs.length; i++){
                let temp = new Date(body.logs[i].LogDate);
                let containLogs = false;
                //push this to the LogsByDayKey if there is a log with the same day 
                for(let j = 0; j < LogsByDayKey.length; j ++) {
                    if(LogsByDayKey[j].day === temp.toDateString()){
                        LogsByDayKey[j].logs.push(body.logs[i]);
                        containLogs = true;
                    }
                }
                //create a new one if there is no object with the same date
                if(!containLogs){
                    let addLogs = {
                        day: temp.toDateString(),
                        logs: [body.logs[i]]                      
                      };
                    LogsByDayKey.push(addLogs);
                }
              }
           
             // everyday
              for(let k =0; k < LogsByDayKey.length; k ++) {
                let dailyUserLogs= [];
                let q = 0;  
                let d = 1; 
                while(q < LogsByDayKey[k].logs.length ){
        
                  let newLog = {
                    unikey: LogsByDayKey[k].logs[q].UniKey,
                    logs: [LogsByDayKey[k].logs[q]]
                  };
                  if(LogsByDayKey[k].logs.length == 1 || q ==LogsByDayKey[k].logs.length-1) {
                    dailyUserLogs.push(newLog);
                    q++;
                  }
        
                  while(d < LogsByDayKey[k].logs.length) {
                    if(LogsByDayKey[k].logs[q].UniKey == LogsByDayKey[k].logs[d].UniKey){
                      newLog.logs.push(LogsByDayKey[k].logs[d]);
                      if(d == LogsByDayKey[k].logs.length-1){
                        q = d;
                      }
                      d++;
                    }
                    else{
                      dailyUserLogs.push(newLog);
                      q = d;
                      d++;                      
                      break;
                    }
                  } 
                }
                LogsByDayKey[k].logs = dailyUserLogs;
              }
              this.setState({ data: LogsByDayKey.reverse() });
            }
            else{
              alert('something went wrong when fetching the logs');
            }
          }
          catch(e){ console.log(e); }
        });
  }
  render(){
    console.log(this.state.data);
    if(this.state.redirect){
        return(
          <Router>
            <Route path="/" exact strict render ={
              () => {
                  return (
                    <div>
                    <Login />
                    </div>
                  )}} 
            />
           <Redirect to='/'/>
          </Router>
        )
      }

    return (
      <div className="fadeInDown">
      <h2 className="viewHeader" >Hello {this.props.user.Name} </h2>
      <button onClick={this.handleOnClick} className="logoutBtn" type="button"  >Log out </button>

      <div className="viewWrapper">  

          {this.state.data.map(data => (
              <dl key={data.day} id="viewFormContent">
                  <dt>{data.day}</dt> 
                  <dd> 
                      {data.logs.map(userLog =>(
                          <div   className="TviewItem" key={userLog.unikey} >
                            
                            <div className="tvStudentName" > {userLog.unikey}</div>
                                      {userLog.logs.map(log => (
                                        <div key={log.LogID}
                                          className= {log.IsQuestion ? "completed":"" }
                                        >
                                          {log.LogDescription}
                                          </div>
                                      ))}
                          </div>
                      ))}
                  </dd>    
              </dl>
          ))}
      </div>
      </div>

    );
  }
}

