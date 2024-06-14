const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const ping = require('ping');
const cors = require('cors');

const app = express();
const port = 9000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

var status = 'inactive';

function updateIPStatus(ipAddress, callback) {
  ping.sys.probe(ipAddress, function (isAlive) {
    status = isAlive ? 'active' : 'inactive';
    callback(status);
  });
}

const db = new sqlite3.Database('ipAddress.db', (err) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log('Connected to the database');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS ips (ip TEXT, status TEXT)`);
  console.log('Table "ips" created successfully.');
});

app.post('/save-ip', (req, res) => {
  const ipAddress = req.body.ipAddress;
  updateIPStatus(ipAddress, (status) => {
    db.run(`INSERT INTO ips (ip, status) VALUES (?, ?)`, [ipAddress, status], (err) => {
      if (err) {
        res.status(500).send('Error occurred while saving to database');
      } else {
        res.status(200).send('Status saved successfully');
      }
    });
  });
});

app.get('/update-status/ips', (req, res) => {
  db.all("SELECT * FROM ips", (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.json(rows);

  });
});

setInterval(() => {
  db.all("SELECT ip FROM ips", (err, rows) => {
    if (err) {
      console.error('Error fetching IP addresses from the database:', err);
      return;
    }
    rows.forEach((row) => {
      updateIPStatus(row.ip, (status) => {
        db.run(`UPDATE ips SET status = ? WHERE ip = ?`, [status, row.ip], (err) => {
          if (err) {
            console.error(`Error updating status for IP ${row.ip}:`, err);
          }
        });
      });
    });
  });
}, 100000)
console.log(status) ;

app.get('/stop-update', (req, res) => {
  clearInterval(myInterval);
  res.send('Update interval stopped');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


