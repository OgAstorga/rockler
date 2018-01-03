import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Sessions } from '../collections/Sessions';
import Session from './Session';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      active_session: null
    };
  }

  render() {
    const { active_session } = this.state;
    const { sessions } = this.props;

    if (active_session !== null) {
      for (let i=0; i<sessions.length; i += 1) {
        if (sessions[i]._id === active_session) {
          const session = sessions[i];

          return (
            <div>
              <a
                style={{ float: 'right' }}
                href="javascript:void(0)"
                onClick={() => this.setState({ active_session: null })}
              >Back</a>
              <h3>{session.machine || session.name}</h3>
              <hr />

              <Session session={session} />
            </div>
          );
        }
      }
    }

    return (
      <div>
        <h3>Sessions</h3>
        <small>{sessions.length} sessions</small>

        {sessions.map((session) => (
          <div
            key={session._id}
            onClick={() => this.setState({ active_session: session._id })}
          >
            {session.machine}
            {session.last_pull.toString()}
          </div>
        ))}
      </div>
    )
  }
}

export default createContainer(() => {
  return {
    sessions: Sessions.find({}).fetch()
  };
}, App);
