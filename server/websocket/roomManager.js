const Y = require('yjs');
const syncProtocol = require('y-protocols/sync');
const awarenessProtocol = require('y-protocols/awareness');
const encoding = require('lib0/encoding');
const decoding = require('lib0/decoding');
const File = require('../models/File');

const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;

class Room {
  constructor(name) {
    this.name = name;
    this.doc = new Y.Doc();
    this.awareness = new awarenessProtocol.Awareness(this.doc);
    this.connections = new Set();
    this.saveTimer = null;
    this.initialContentLoaded = false;

    // Listen to document updates and broadcast to all connected clients
    this.doc.on('update', (update, origin) => {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_SYNC);
      syncProtocol.writeUpdate(encoder, update);
      const message = encoding.toUint8Array(encoder);

      this.connections.forEach((conn) => {
        if (conn !== origin && conn.readyState === 1 /* OPEN */) {
          conn.send(message);
        }
      });

      // Schedule debounced database persistence
      this.scheduleSave();
    });

    // Listen to awareness updates and broadcast to all connected clients
    this.awareness.on('update', ({ added, updated, removed }, origin) => {
      const changedClients = added.concat(updated).concat(removed);
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients)
      );
      const message = encoding.toUint8Array(encoder);

      this.connections.forEach((conn) => {
        if (conn !== origin && conn.readyState === 1 /* OPEN */) {
          conn.send(message);
        }
      });
    });
  }

  // Load initial content from MongoDB if doc is empty
  async loadInitialContent(fileId) {
    if (this.initialContentLoaded || !fileId) return;
    try {
      const file = await File.findById(fileId);
      if (file && file.content) {
        const yText = this.doc.getText('monaco');
        if (yText.length === 0) {
          yText.insert(0, file.content);
        }
      }
      this.initialContentLoaded = true;
    } catch (err) {
      console.error(`[RoomManager] Error loading initial content for file ${fileId}:`, err.message);
    }
  }

  // Debounced save to MongoDB
  scheduleSave() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    this.saveTimer = setTimeout(async () => {
      await this.saveContent();
    }, 2000);
  }

  async saveContent() {
    try {
      // Room name format: "file_<fileId>" or "project_<projectId>_<fileId>"
      const parts = this.name.split('_');
      const fileId = parts[parts.length - 1];

      if (fileId && fileId.length === 24) { // valid Mongo ObjectId length
        const yText = this.doc.getText('monaco');
        const content = yText.toString();
        await File.findByIdAndUpdate(fileId, { content });
      }
    } catch (err) {
      console.error(`[RoomManager] Failed to persist file content for room ${this.name}:`, err.message);
    }
  }

  destroy() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    // Final save before closing room
    this.saveContent().catch(() => {});
    this.awareness.destroy();
    this.doc.destroy();
  }
}

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  getRoom(roomName) {
    return this.rooms.get(roomName);
  }

  getOrCreateRoom(roomName) {
    let room = this.rooms.get(roomName);
    if (!room) {
      room = new Room(roomName);
      this.rooms.set(roomName, room);

      // Check if room name contains fileId and preload content
      const parts = roomName.split('_');
      const fileId = parts[parts.length - 1];
      if (fileId && fileId.length === 24) {
        room.loadInitialContent(fileId);
      }
    }
    return room;
  }

  removeConnection(roomName, ws) {
    const room = this.rooms.get(roomName);
    if (!room) return;

    room.connections.delete(ws);

    // If client had an awareness client ID associated
    if (ws.controlledUserIds && ws.controlledUserIds.size > 0) {
      awarenessProtocol.removeAwareStates(
        room.awareness,
        Array.from(ws.controlledUserIds),
        null
      );
    }

    // If no more connections in room, clean up after grace period
    if (room.connections.size === 0) {
      setTimeout(() => {
        if (room.connections.size === 0) {
          room.destroy();
          this.rooms.delete(roomName);
        }
      }, 10000);
    }
  }
}

const roomManager = new RoomManager();

module.exports = {
  roomManager,
  MESSAGE_SYNC,
  MESSAGE_AWARENESS
};
