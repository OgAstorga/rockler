import { Meteor } from 'meteor/meteor';
import { Sessions } from '../collections/Sessions';

WebApp.connectHandlers.use("/hear", (req, res, next) => {
  const machine = req.url.match(/^\/(.*)$/)[1];

  let session = Sessions.findOne({
    machine
  });

  // Create session
  if (!session) {
    session = {
      machine,
      create_at: new Date(),
      last_pull: new Date(0),
      commands: []
    };

    session._id = Sessions.insert(session);
  }

  // Update last conection
  Sessions.update(session._id, {
    $set: {
      last_pull: new Date()
    }
  });

  let cmdId = -1;
  session.commands.forEach((cmd, ix) => {
    if (cmdId !== -1) return;
    if (cmd.status === 'pending') cmdId = ix;
  });

  if (cmdId === -1) {
    res.writeHead(204);
    return res.end();
  }

  const command = session.commands[cmdId];

  res.writeHead(200);
  res.end(JSON.stringify({
    id: cmdId,
    cmd: command.command,
  }));
});

WebApp.connectHandlers.use("/talk", (req, res, next) => {
  const machine = req.url.match(/^\/(.*)$/)[1];

  let session = Sessions.findOne({
    machine
  });

  let body = '';
  req.on('data', function(chunk) {
    body += chunk;
  });

  req.on('end', Meteor.bindEnvironment(function() {
    try {
      body = JSON.parse(body);
    } catch (error) {
      res.writeHead(400);
      return res.end();
    }

    const cid = body.id;

    const setter = {
      $set: {
        ['commands.' + cid + '.answered_at']: new Date(),
        ['commands.' + cid + '.status']: 'done',
        ['commands.' + cid + '.cmdStatus']: body.cmdStatus,
        ['commands.' + cid + '.stdout']: body.stdout,
        ['commands.' + cid + '.stderr']: body.stderr,
      }
    };

    Sessions.update(session._id, setter);

    res.writeHead(200);
    res.end();
  }));
});
