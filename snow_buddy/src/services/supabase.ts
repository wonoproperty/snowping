import { createClient } from '@supabase/supabase-js';
import type { BroadcastMessage, PresenceState } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class RealtimeService {
  private channel: ReturnType<typeof supabase.channel> | null = null;
  private userId: string | null = null;
  private username: string | null = null;

  async joinGroup(groupCode: string, username: string, userId: string) {
    if (this.channel) {
      await this.leaveGroup();
    }

    this.username = username;
    this.userId = userId;

    this.channel = supabase.channel(`group:${groupCode}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    return this.channel;
  }

  async leaveGroup() {
    if (this.channel) {
      await this.channel.unsubscribe();
      this.channel = null;
    }
    this.username = null;
    this.userId = null;
  }

  trackPresence() {
    if (!this.channel || !this.userId || !this.username) return;

    const presenceState: PresenceState = {
      user_id: this.userId,
      username: this.username,
      last_seen: new Date().toISOString(),
    };

    this.channel.track(presenceState);
  }

  broadcastLocation(latitude: number, longitude: number) {
    if (!this.channel || !this.userId || !this.username) return;

    const message: BroadcastMessage = {
      type: 'location_update',
      user_id: this.userId,
      username: this.username,
      location: {
        latitude,
        longitude,
        timestamp: Date.now(),
      },
    };

    this.channel.send({
      type: 'broadcast',
      event: 'location_update',
      payload: message,
    });
  }

  onPresenceChange(callback: (presences: Record<string, PresenceState[]>) => void) {
    if (!this.channel) return;

    this.channel.on('presence', { event: 'sync' }, () => {
      const presences = this.channel!.presenceState<PresenceState>();
      callback(presences);
    });

    this.channel.on('presence', { event: 'join' }, () => {
      const currentPresences = this.channel!.presenceState<PresenceState>();
      callback(currentPresences);
    });

    this.channel.on('presence', { event: 'leave' }, () => {
      const currentPresences = this.channel!.presenceState<PresenceState>();
      callback(currentPresences);
    });
  }

  onLocationUpdate(callback: (message: BroadcastMessage) => void) {
    if (!this.channel) return;

    this.channel.on(
      'broadcast',
      { event: 'location_update' },
      ({ payload }) => {
        callback(payload as BroadcastMessage);
      }
    );
  }

  async subscribe() {
    if (!this.channel) return;
    
    return this.channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        this.trackPresence();
      }
    });
  }
}

export const realtimeService = new RealtimeService();