const fs = require("fs").promises;
const path = require('path');
const SNAPSHOT_FILE = path.join('D:', 'myOwnRedis', 'myRedis', 'backupData', 'backup.json');


class Redis {
  constructor(memoryLimit = 50 * 1024 * 1024, evictionPolicy = "LRU") {
    this.data = {};
    this.ttl = {};
    this.channels = {};
    this.lastAccessTime = {};
    this.currentMemoryUseage = 0;
    this.memoryLimit = memoryLimit;
    this.evictionPolicy = evictionPolicy;

    this.loadFromSnapshot();
  }

  set(key, value, expiryTime = null) {
    const keyValuePairSize = this._estimateMemoryUsage(key, value);

    // if eviction is necessary keep applying until condition is met.
    while (this.currentMemoryUseage + keyValuePairSize > this.memoryLimit) {
      this._applyEvictionPolicy();
    }

    this.data[key] = value;
    this.currentMemoryUseage += keySize;

    if (expiryTime) {
      const expireAt = Date.now() + expiryTime * 1000;
      this.ttl[key] = expireAt;
      this._scheduleExpiry(key);
    }
    this.lastAccessTime[key] = Date.now();
  }

  get(key) {
    if (this._isExpired(key)) {
      return null;
    }
    if (this.data[key]) {
      this.lastAccessTime[key] = Date.now();
      return this.data[key];
    }
    return null;
  }

  del(key) {
    const keySize = this._estimateMemoryUsage(key, this.data[key]);
    delete this.data[key];
    delete this.ttl[key];
    delete this.lastAccessTime[key];
    this.currentMemoryUseage -= keySize;
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
      
       fs.stat(SNAPSHOT_FILE, (err, fileStats) => {
        if (err) {
          console.log(err)
        } else {
          const result = convertBytes(fileStats.size)
          console.log("File Size of Loaded Snapshot: ",result);
          
        }
      })

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

  convertBytes(bytes) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  
    if (bytes == 0) {
      return "n/a"
    }
  
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  
    if (i == 0) {
      return bytes + " " + sizes[i]
    }
  
    return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i]
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

  unsubscribe(ws, channel) {
    if (this.channels[channel]) {
      this.channels[channel].delete(ws);
      if (this.channels[channel].size === 0) {
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

  disconnect(ws) {
    for (const channel in this.channel) {
      this.channels[channel].delete(ws);
      if (this.channels[channel].size === 0) {
        delete this.channels[channel];
      }
    }
  }
  /***                                      */

  /** Eviction and Memory Related Methods  ****/

  _estimateMemoryUsage(key, value) {
    const keySize = Buffer.byteLength(key, "utf8");
    const valueSize = Buffer.byteLength(JSON.stringify(value), "utf8");
    return keySize + valueSize;
  }

  _applyEvictionPolicy() {
    switch (this.evictionPolicy) {
      case "LRU":
        this._evictLRU();
        break;
      default:
        throw new Error("Invalid Eviction Policy");
    }
  }

  _evictLRU() {
    let lruKey = null;
    let oldestAccessTime = Infinity;

    for (const key in this.lastAccessTime) {
      if (this.lastAccessTime[key] < oldestAccessTime) {
        oldestAccessTime = this.lastAccessTime[key];
        lruKey = key;
      }
    }

    if (lruKey) {
      this.del(lruKey);
      console.log(`Evicted LRU key : ${lruKey}`);
    }
  }

  /***            */
}

module.exports = Redis;
