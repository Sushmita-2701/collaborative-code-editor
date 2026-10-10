import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

export class CollaborationService {
  constructor(roomName, user) {
    this.roomName = roomName;
    this.user = user;
    this.doc = new Y.Doc();

    // Initialize WebSocket Provider for real-time synchronization
    this.provider = new WebsocketProvider(WS_URL, roomName, this.doc, {
      connect: true,
      params: { room: roomName }
    });

    // Set awareness metadata for current user (name, color, cursor position)
    if (this.provider.awareness && user) {
      this.provider.awareness.setLocalStateField('user', {
        id: user._id || user.id,
        name: user.name || 'Anonymous',
        color: user.color || '#38bdf8',
        email: user.email || ''
      });
    }

    this.yText = this.doc.getText('monaco');
  }

  onStatusChange(callback) {
    this.provider.on('status', callback);
  }

  onAwarenessChange(callback) {
    this.provider.awareness.on('change', callback);
  }

  getOnlineUsers() {
    if (!this.provider.awareness) return [];
    const states = this.provider.awareness.getStates();
    const users = [];
    states.forEach((state, clientId) => {
      if (state.user) {
        users.push({
          clientId,
          ...state.user
        });
      }
    });
    return users;
  }

  destroy() {
    if (this.provider) {
      this.provider.destroy();
    }
    if (this.doc) {
      this.doc.destroy();
    }
  }
}
