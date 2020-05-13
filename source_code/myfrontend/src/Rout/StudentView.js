import React from 'react';
import '../App.css';

export default class StudentView extends React.Component {
    constructor(props) {
        super(props);
        //have an array of logs, contains date and obeject
        this.state = {
            data:[]
          }
        };


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
                 
                //lop through each logs.
                // if this.state.logs.date = body.logs[i]
                    //add this logs to th date
                //elas create a new logs and add it to the stae 

                this.setState({
                    data: dailyLogs
                });
              }
              else{
                alert('something went wrong when fetching the logs');
              }
            }
            catch(e){
              console.log(e); 
            }
          });

    } 
  
    render(){
        console.log(this.state.data);
        return (

            <div>
                <h2>Hello {this.props.user.Name} </h2>

                <div className="StudentViewForm">    
               
                            {this.state.data.map(data => (
                                <dl key={data.day}>
                                    <dt>{data.day}</dt>  
                                    <dd> {data.logs.map(log =>(
                                        <table key={log.LogID}>
                                            <tr>
                                            <th>{log.LogDate}</th>
                                            <th>{log.LogDescription}</th>
                                            </tr>
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

