import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';

/**
 * Enhanced offline detection for Capacitor apps
 */
export class CapacitorOffline {
  private static listeners: Array<(status: boolean) => void> = [];

  /**
   * Initialize network monitoring for native apps
   */
  static async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      // Get initial status
      const status = await Network.getStatus();
      this.notifyListeners(status.connected);

      // Listen for changes
      Network.addListener('networkStatusChange', (status) => {
        this.notifyListeners(status.connected);
      });
    } catch (error) {
      console.error('Failed to initialize network monitoring:', error);
    }
  }

  /**
   * Add listener for network status changes
   */
  static addListener(callback: (isOnline: boolean) => void): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get current network status
   */
  static async getStatus(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return navigator.onLine;
    }

    try {
      const status = await Network.getStatus();
      return status.connected;
    } catch (error) {
      console.error('Failed to get network status:', error);
      return navigator.onLine;
    }
  }

  /**
   * Check if running on native platform
   */
  static isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Get platform name
   */
  static getPlatform(): string {
    return Capacitor.getPlatform();
  }

  private static notifyListeners(isOnline: boolean): void {
    this.listeners.forEach(listener => {
      try {
        listener(isOnline);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });
  }
}
