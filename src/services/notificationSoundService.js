import { Audio } from 'expo-av';
import { Vibration } from 'react-native';

/**
 * Notification Sound Service
 * Handles playing notification sounds for new service requests
 */
class NotificationSoundService {
  constructor() {
    this.sound = null;
    this.isPlaying = false;
  }

  /**
   * Initialize audio mode
   */
  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  /**
   * Play notification sound for new service request
   * Uses a pleasant, attention-grabbing sound
   */
  async playNewRequestSound() {
    try {
      // Stop any currently playing sound
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      }

      // Create and play new sound
      // Using a system sound for now - in production, add custom sound file
      const { sound } = await Audio.Sound.createAsync(
        // You can replace this with a custom sound file:
        // require('../../assets/sounds/new-request.mp3')
        { uri: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg' },
        { shouldPlay: true, volume: 1.0 }
      );

      this.sound = sound;
      this.isPlaying = true;

      // Vibrate pattern: short-long-short
      Vibration.vibrate([0, 200, 100, 400, 100, 200]);

      // Set up playback status update
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          this.isPlaying = false;
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error playing notification sound:', error);
      // Fallback to vibration only
      Vibration.vibrate([0, 200, 100, 400, 100, 200]);
      return { success: false, error: error.message };
    }
  }

  /**
   * Play urgent notification sound (for high-priority requests)
   */
  async playUrgentRequestSound() {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg' },
        { shouldPlay: true, volume: 1.0, isLooping: false }
      );

      this.sound = sound;
      this.isPlaying = true;

      // More intense vibration pattern
      Vibration.vibrate([0, 300, 100, 300, 100, 300, 100, 300]);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          this.isPlaying = false;
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error playing urgent sound:', error);
      Vibration.vibrate([0, 300, 100, 300, 100, 300, 100, 300]);
      return { success: false, error: error.message };
    }
  }

  /**
   * Stop currently playing sound
   */
  async stopSound() {
    try {
      if (this.sound && this.isPlaying) {
        await this.sound.stopAsync();
        this.isPlaying = false;
      }
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
        this.isPlaying = false;
      }
    } catch (error) {
      console.error('Error cleaning up sound:', error);
    }
  }

  /**
   * Check if sound is currently playing
   */
  getIsPlaying() {
    return this.isPlaying;
  }
}

// Export singleton instance
export default new NotificationSoundService();
