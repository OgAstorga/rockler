import React, { Component } from 'react';
import { Sessions } from '../collections/Sessions';

class CommandSection extends Component {
  render() {
    const { label, value } = this.props;

    if (value === undefined || value === '') {
      return null;
    }

    return (
      <div className="section">
        <label>{label}</label>
        <pre>{value}</pre>
      </div>
    );
  }
}

class Session extends Component {
  constructor(props) {
    super(props);

    const session = props.session;

    this.state = {
      command: '',
      focus: session.commands.length - 1
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.session.commands.length !==
        this.props.session.commands.length
    ) {
      this.setState({
        focus: nextProps.session.commands.length - 1
      });
    }
  }

  sendCommand(event) {
    event.preventDefault();

    const { command } = this.state;
    const { session } = this.props;

    if (!command) return;

    this.setState({
      command: ''
    });

    Sessions.update(session._id, {
      $push: {
        'commands': {
          command,
          status: 'pending',
          created_at: new Date(),
        }
      }
    });
  }

  cancelCommand(index, event) {
    event.preventDefault();

    const { session } = this.props;

    const setter = {};
    setter['commands.' + index + '.status'] = 'canceled';

    Sessions.update(session._id, {
      $set: setter
    });
  }

  renderHistory() {
    const { focus } = this.state;
    const { session } = this.props;

    const commands = session.commands.map((c,i) => {
      c.id = i;
      return c;
    }).reverse();

    return (
      <div className="history">
        {commands.map(command => (
          <div
            key={command.id}
            className={(command.id === focus) ? 'cmd active' : 'cmd'}
            onClick={() => this.setState({ focus: command.id })}
          >
            <div className="status">{command.status}</div>
            <div className="command">{command.command}</div>
          </div>
        ))}
      </div>
    );
  }

  renderCommand() {
    const { focus } = this.state;
    const { session } = this.props;

    if (focus === -1) {
      return null;
    }

    const command = session.commands[focus];

    let notes = [];
    notes.push({
      label: 'sent',
      value: command.created_at.toString(),
    });

    if (command.status === 'done') {
      notes.push({
        label: 'received',
        value: command.answered_at.toString(),
      });
    }

    if (command.status === 'pending') {
      notes.push({
        label: 'actions',
        value: (
          <a href="#" onClick={this.cancelCommand.bind(this, focus)}>cancel</a>
        )
      });
    }

    return (
      <div className="command">
        <CommandSection
          label="command"
          value={command.command}
        />

        <CommandSection
          label="stdout"
          value={command.stdout}
        />

        <CommandSection
          label="stderr"
          value={command.stderr}
        />

        <CommandSection
          label="return code"
          value={command.cmdStatus}
        />

        {notes.map((note, ix) => (
          <div key={ix} className="note"><b>{note.label}</b> {note.value}</div>
        ))}
      </div>
    );
  }

  render() {
    const { session } = this.props;

    return (
      <div>
        {/* composer */}
        <form
          onSubmit={this.sendCommand.bind(this)}
        >
          <div>
            <input
              className="composer"
              value={this.state.command}
              placeholder="Send command"
              onChange={event => this.setState({ command: event.target.value })}
            />
          </div>
        </form>

        {/* commands */}
        <div className="session">
          {this.renderHistory()}
          {this.renderCommand()}
        </div>
      </div>
    )
  }
}

export default Session;
