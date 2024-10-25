# MyRedis
![unnamed](https://github.com/user-attachments/assets/daf4dec8-bb6b-4335-b994-e2468fd538ec)

A lightweight, custom Redis-inspired data store built in Node.js, providing core Redis features such as key-value storage, TTL (Time-To-Live) expiration, Pub/Sub for real-time messaging, data persistence through snapshotting, and configurable memory eviction policies. 

## Features

1. **Key-Value Storage:**  
   Basic operations for storing (`SET`), retrieving (`GET`), and deleting (`DEL`) key-value pairs.

2. **TTL Expiration:**  
   Set an expiration time for keys, allowing them to automatically expire after a specified duration.

3. **Data Persistence (Snapshotting):**  
   Persistent storage of in-memory data to a JSON file, with configurable intervals for automatic snapshot creation.

4. **Pub/Sub System:**  
   Real-time messaging using WebSocket connections. Supports channels to which clients can subscribe or unsubscribe, allowing message broadcasting to all subscribers of a particular channel.

5. **Memory Management and Eviction Policies:**  
   Configurable memory limit with support for different eviction policies, including:
   - **LRU (Least Recently Used):** Evicts the least recently accessed keys.

---

## Getting Started

### Prerequisites

- **Node.js** (>= v12)
- **WebSocket** - included in the package

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/myredis.git
   cd myredis
   ```

2. **Install Dependencies** (if there are any external modules you add):

   ```bash
   npm install
   ```

3. **Run the Redis Server (CLI)**:

   ```bash
   node cli.js
   ```

   You can start using the CLI interface to run commands such as `SET`, `GET`, and `DEL`.

4. **Run the WebSocket Server for Pub/Sub**:

   ```bash
   node clientsub.js
   ```

   This will set up the WebSocket server on `ws://localhost:8080`.

---

## Usage

### Command-Line Interface (CLI)

The CLI allows you to interact with the Redis instance. Below are some commands you can use:

- **SET key value [ttl]**: Stores a value associated with a key. Optionally, you can set a TTL (in seconds) for the key.

  ```bash
  SET myKey myValue 60
  ```

- **GET key**: Retrieves the value associated with the key.

  ```bash
  GET myKey
  ```

- **DEL key**: Deletes the key and its associated value.

  ```bash
  DEL myKey
  ```

### Pub/Sub System

To enable Pub/Sub functionality, run the WebSocket server (`clientsub.js`) and use the provided `clientSub.js` and `clientPub.js` clients to simulate subscribing and publishing.

- **Subscribe to a Channel**:

   ```javascript
   ws.send(JSON.stringify({ action: "subscribe", channel: "news" }));
   ```

- **Publish to a Channel**:

   ```javascript
   ws.send(JSON.stringify({ action: "publish", channel: "news", message: "Breaking news!" }));
   ```

### Data Persistence

The application will automatically create snapshots of in-memory data at regular intervals, which can be configured in the code (default is every 15 seconds). Snapshots are saved as JSON files in the directory specified by `SNAPSHOT_FILE`.

To load data from a snapshot on startup, the system checks for an existing snapshot file and loads the data if available.

### Memory Management and Eviction Policies

You can specify a memory limit (in bytes) and choose an eviction policy (`LRU`, `LFU`, or `RANDOM`) when creating the Redis instance.

Example:

```javascript
const redis = new Redis(50 * 1024 * 1024, 'LRU'); // 50 MB memory limit with LRU eviction
```

Eviction policies determine which key will be removed when the memory limit is reached:

- **LRU (Least Recently Used)**: Removes the key that was accessed least recently.


---

## Project Structure

- `redis.js`: Core Redis class with data storage, TTL, persistence, Pub/Sub, and eviction logic.
- `cli.js`: Command-line interface for interacting with the Redis instance.
- `clientsub.js`: WebSocket server for handling Pub/Sub requests.
- `clientPub.js`: Publisher client for publishing messages to a channel.
- `clientSub.js`: Subscriber client for receiving messages from a subscribed channel.

---

## Example Scenarios

1. **Setting Data with Expiration**:

   ```javascript
   SET myKey myValue 120 // Sets myKey with a value and a 2-minute TTL
   ```

2. **Data Persistence**:

   - Data is automatically saved to a snapshot file every 15 seconds.
   - If the system restarts, it will load data from the snapshot.

3. **Pub/Sub**:

   - Start the WebSocket server.
   - Subscribe to a channel from one client and publish messages from another.
   - Subscribed clients receive the messages in real-time.

4. **Eviction Policy with Memory Limit**:

   - Initialize Redis with a memory limit of 5MB and an LRU eviction policy.
   - When the limit is reached, the least recently used keys are removed to free up space.

---
