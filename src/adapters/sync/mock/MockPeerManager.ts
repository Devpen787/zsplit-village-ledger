
import { PeerInfo, PeerConnection } from '../types';
import { MockEventEmitter } from './MockEventEmitter';

export class MockPeerManager {
  private peers: Map<string, PeerInfo> = new Map();
  private eventEmitter: MockEventEmitter;

  constructor(eventEmitter: MockEventEmitter) {
    this.eventEmitter = eventEmitter;
  }

  async getPeers(): Promise<PeerInfo[]> {
    return Array.from(this.peers.values());
  }

  async connectToPeer(peerId: string): Promise<void> {
    this.peers.set(peerId, {
      id: peerId,
      status: 'online',
      lastSeen: Date.now()
    });
    
    this.eventEmitter.emit('peer_connected', { type: 'peer_connected', peerId });
  }

  async disconnectFromPeer(peerId: string): Promise<void> {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.status = 'offline';
      this.peers.set(peerId, peer);
    }
    
    this.eventEmitter.emit('peer_disconnected', { type: 'peer_disconnected', peerId });
  }

  getPeerConnections(): PeerConnection[] {
    return Array.from(this.peers.values()).map(peer => ({
      id: peer.id,
      status: peer.status === 'online' ? 'connected' : 'disconnected',
      lastSeen: peer.lastSeen,
      syncProgress: undefined
    }));
  }

  clear(): void {
    this.peers.clear();
  }
}
