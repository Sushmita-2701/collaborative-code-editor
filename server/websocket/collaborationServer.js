const { WebSocketServer } = require('ws');
const url = require('url');
const syncProtocol = require('y-protocols/sync');
const awarenessProtocol = require('y-protocols/awareness');
const encoding = require('lib0/encoding');
const decoding = require('lib0/decoding');
const { roomManager, MESSAGE_SYNC, MESSAGE_AWARENESS } = require('./roomManager');

const setupCollaborationServer = (httpServer) => {
  const wss = new WebSocketServer({ noServer: true });

  // Handle HTTP upgrade requests
  httpServer.on('upgrade', (request, socket, head) => {
    const pathname = url.parse(request.url).pathname;

    // Handle WebSocket on /ws, /collaboration, or any path
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', (ws, req) => {
    const parsedUrl = url.parse(req.url, true);
    // Support room passed via query (?room=...) or URL pathname /roomName
    let roomName = parsedUrl.query.room;
    if (!roomName && parsedUrl.pathname && parsedUrl.pathname.length > 1) {
      roomName = parsedUrl.pathname.replace(/^\/(ws\/)?/, '');
    }
    if (!roomName) {
      roomName = 'default-room';
    }

    const room = roomManager.getOrCreateRoom(roomName);
    room.connections.add(ws);
    ws.roomName = roomName;
    ws.isAlive = true;
    ws.controlledUserIds = new Set();

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // 1. Send Sync Step 1 to new client
    const syncEncoder = encoding.createEncoder();
    encoding.writeVarUint(syncEncoder, MESSAGE_SYNC);
    syncProtocol.writeSyncStep1(syncEncoder, room.doc);
    ws.send(encoding.toUint8Array(syncEncoder));

    // 2. Send current awareness states to new client
    const awarenessStates = room.awareness.getStates();
    if (awarenessStates.size > 0) {
      const awarenessEncoder = encoding.createEncoder();
      encoding.writeVarUint(awarenessEncoder, MESSAGE_AWARENESS);
      encoding.writeVarUint8Array(
        awarenessEncoder,
        awarenessProtocol.encodeAwarenessUpdate(
          room.awareness,
          Array.from(awarenessStates.keys())
        )
      );
      ws.send(encoding.toUint8Array(awarenessEncoder));
    }

    // Handle incoming client messages
    ws.on('message', (message) => {
      try {
        const uint8Msg = new Uint8Array(message);
        const decoder = decoding.createDecoder(uint8Msg);
        const messageType = decoding.readVarUint(decoder);

        if (messageType === MESSAGE_SYNC) {
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, MESSAGE_SYNC);
          syncProtocol.readSyncMessage(decoder, encoder, room.doc, ws);

          // If there is a response (e.g., sync step 2 or update), send it back to the client
          if (encoding.length(encoder) > 1) {
            ws.send(encoding.toUint8Array(encoder));
          }
        } else if (messageType === MESSAGE_AWARENESS) {
          const update = decoding.readVarUint8Array(decoder);
          // Apply update and track client IDs
          awarenessProtocol.applyAwarenessUpdate(room.awareness, update, ws);
        }
      } catch (err) {
        console.error(`[WebSocket] Error processing message in room ${roomName}:`, err.message);
      }
    });

    ws.on('close', () => {
      roomManager.removeConnection(roomName, ws);
    });

    ws.on('error', (err) => {
      console.error(`[WebSocket] Client error in room ${roomName}:`, err.message);
      roomManager.removeConnection(roomName, ws);
    });
  });

  // Heartbeat ping interval
  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        if (ws.roomName) {
          roomManager.removeConnection(ws.roomName, ws);
        }
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(pingInterval);
  });

  console.log('[WebSocket] Collaboration server initialized and attached to HTTP server.');
  return wss;
};

module.exports = { setupCollaborationServer };
