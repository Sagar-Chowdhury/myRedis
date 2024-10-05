const fs = require("fs").promises;
const path = require('path');
const SNAPSHOT_FILE = path.join('D:', 'myOwnRedis', 'myRedis', 'backupData', 'backup.json');


class Redis {

  constructor() {
    this.data = {};
    this.ttl = {};
    this.channels = {};

    this.loadFromSnapshot();
  }

  set(key, value, expiryTime = null) {
    this.data[key] = value;
    if (expiryTime) {
      const expireAt = Date.now() + expiryTime * 1000;
      this.ttl[key] = expireAt;
      this._scheduleExpiry(key);
    }
  }

  get(key) {
    if (this._isExpired(key)) {
      return null;
    }
    return this.data[key];
  }

  del(key) {
    delete this.data[key];
    delete this.ttl[key];
  }

  _isExpired(key) {
    if (this.ttl[key] && Date.now() > this.ttl[key]) {
      this.del(key);
      return true;
    }
    return false;
  }

  _scheduleExpiry(key, expireAt) {
    const timeOut = expireAt - Date.now();
    setTimeout(() => {
      if (this.ttl[key] && Date.now() > this.ttl[key]) {
        this.del[key];
      }
    }, timeOut);
  }

  /*** Snapshotting Process For Persistence  ***/
  async loadFromSnapshot() {
    try {
      // Check if file exists by using fs.access, which will throw an error if the file does not exist
      await fs.access(SNAPSHOT_FILE);

      // If no error, the file exists, proceed to read it
      const snapshotData = await fs.readFile(SNAPSHOT_FILE, "utf-8");
      const { data, ttl } = JSON.parse(snapshotData);

      this.data = data;
      this.ttl = ttl;

      console.log("Data loaded from Snapshot.");
    } catch (err) {
      // Handle file not found error
      if (err.code === "ENOENT") {
        console.log("Snapshot file does not exist.");
      } else {
        console.log("Error loading snapshot:", err);
      }
    }
  }

  async saveSnapShot() {
    const snapshotData = {
      data: this.data,
      ttl: this.ttl,
    };

    try {
      await fs.writeFile(SNAPSHOT_FILE, JSON.stringify(snapshotData, null, 2));

      console.log("Snapshot Saved Successfully");
    } catch (err) {
      console.log("Failed to Save Snapshot", err);
    }
  }

  startSnapshotInterval(intervalInSeconds) {
    setInterval(() => {
      this.saveSnapShot();
    }, intervalInSeconds * 1000);
  }
  /***  Snapshotting Done  */

  /*** Pub/Sub Functionality via WebSockets */

  subscribe(ws, channel) {
    if (!this.channels[channel]) {
      this.channels[channel] = new Set();
    }

    this.channels[channel].add(ws);
    console.log(`Client Subscribed to channel: ${channel}`);
  }

  unsubscribe(ws,channel){
    if(this.channels[channel]){
        this.channels[channel].delete(ws);
        if(this.channels[channel].size === 0){
            delete this.channels[channel];
        }
    }
    console.log(`Client Unsunbscribed to Channel: ${channel} `);
  }
  
  publish(channel, message) {
    if (this.channels[channel]) {
      this.channels[channel].forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({ channel, message }));
        }
      });
    } else {
      console.log(`No subscribers for channel: ${channel}`);
    }
  }

  disconnect(ws){
    for(const channel in this.channel){
        this.channels[channel].delete(ws);
        if(this.channels[channel].size === 0){
            delete this.channels[channel];
        }
    }
  }  
  /***                                      */

}

module.exports = Redis;
