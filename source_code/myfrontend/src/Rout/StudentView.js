import React from 'react';
import '../App.css';
import {BrowserRouter as Router, Route, Redirect} from 'react-router-dom'
import Login from '../Login';

export default class StudentView extends React.Component {
    constructor(props) {
        super(props);
        //have an array of logs, contains date and obeject
        this.state = {
            data:[],
            redirect: false
          }
    };
    handleOnClick = () => {
        this.setState({ redirect: true });
    }
    //get called whenever the component is renered
    componentDidMount = () => {
        fetch('/studentLogs', { 
            method: 'POST',
            headers: {
              'Accept': 'application/json', 
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
              unikey: this.props.user.UniKey
            })
        })
        .then(response => response.json())
          .then(body=>{
            try{
              if(body.isSuccess){

                let dailyLogs = [];

                for(let i = 0; i < body.logs.length; i++){
                    let temp = new Date(body.logs[i].LogDate);
                    let containLogs = false;
                    //push this to the dailylogs if there is a  the same day
                    for(let j = 0; j < dailyLogs.length; j ++) {
                        if(dailyLogs[j].day == temp.toDateString()){
                            body.logs[i].LogDate = temp.toLocaleTimeString('it-IT');
                            dailyLogs[j].logs.push(body.logs[i]);
                            containLogs = true;
                        }
                    }
                    //create a new one if there is no object with the same date
                    if(!containLogs){
                        body.logs[i].LogDate = temp.toLocaleTimeString('it-IT');
                        let addLogs = {
                            day: temp.toDateString(),
                            logs: [body.logs[i]]
                        };
                        dailyLogs.push(addLogs);
                    }
                }
                this.setState({ data: dailyLogs.reverse() });
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
                        <dl key={data.day}  id="viewFormContent">
                            <dt>{data.day}</dt> 
                            <dd className="viewItem"> 
                                {data.logs.map(log =>(
                                    <table key={log.LogID}>
                                        <tbody>
                                            <tr>
                                                <td>{log.LogDate}</td>
                                                <td className="viewItemText">{log.LogDescription}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                ))}
                            </dd>    
                        </dl>
                    ))}
                </div>
            </div>
        );
    }
}

