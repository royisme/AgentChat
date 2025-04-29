// src/composables/useAudioPlayer.ts
import { ref, type Ref } from 'vue';
import { base64ToUint8Array } from '@/utils/helpers';
import type { ReceivedAudio } from '@/types/chat';

export function useAudioPlayer () {
  const isPlaying: Ref<boolean> = ref(false);
  const error: Ref<string | null> = ref(null);

  const audioContext: Ref<AudioContext | null> = ref(null);
  const audioQueue: Ref<{ buffer: ArrayBuffer, rate: number }[]> = ref([]);
  const lastAudioTime: Ref<number> = ref(0);
  const isProcessingQueue: Ref<boolean> = ref(false);
  const currentPlaybackRate: Ref<number | null> = ref(null);
  const currentSourceNode: Ref<AudioBufferSourceNode | null> = ref(null);
  const ensureAudioContext = async (sampleRate: number): Promise<AudioContext | null> => {
    if (audioContext.value && audioContext.value.state !== 'closed' && currentPlaybackRate.value === sampleRate) {
      // Reuse existing context if rate matches and it's usable
      if (audioContext.value.state === 'suspended') {
        try { await audioContext.value.resume(); } catch (e) { console.error('Failed to resume existing AudioContext', e); return null; }
      }
      return audioContext.value;
    }

    // Close existing context if rate mismatches or it's closed
    if (audioContext.value) {
      console.log(`Sample rate mismatch or context closed. Old: ${currentPlaybackRate.value}, New: ${sampleRate}. Recreating AudioContext.`);
      try {
        await audioContext.value.close();
      } catch(e) { console.error('Error closing previous AudioContext', e); }
      audioContext.value = null; // Ensure it's null before recreating
    }

    // Create new context with the specified sample rate
    try {
      console.log(`Creating new AudioContext with sample rate: ${sampleRate}`);
      audioContext.value = new AudioContext({ sampleRate });
      currentPlaybackRate.value = sampleRate; // Store the new rate
      lastAudioTime.value = audioContext.value.currentTime; // Reset playhead time
      // Attempt to resume immediately in case it starts suspended
      if (audioContext.value.state === 'suspended') {
        await audioContext.value.resume();
      }
      return audioContext.value;
    } catch (e) {
      console.error(`Error creating AudioContext with rate ${sampleRate}:`, e);
      error.value = `Failed to create AudioContext (Rate: ${sampleRate}). Playback disabled.`;
      audioContext.value = null;
      currentPlaybackRate.value = null;
      return null;
    }
  };

  /** Adds decoded audio data and its sample rate to the queue */
  const addAudioChunk = (audioInfo: ReceivedAudio) => {
    error.value = null;
    try {
      const uint8ArrayChunk = base64ToUint8Array(audioInfo.data);
      if (uint8ArrayChunk.length > 0) {
        // Store buffer and rate together
        audioQueue.value.push({ buffer: uint8ArrayChunk.buffer, rate: audioInfo.rate });
        processAudioQueue(); // Trigger processing
      } else {
        console.warn('Received empty audio chunk after decoding.');
      }
    } catch (e) {
      console.error('Error decoding or queuing audio chunk:', e);
      error.value = `Error handling audio chunk: ${e instanceof Error ? e.message : String(e)}`;
    }
  };

  /** Processes and schedules audio buffers from the queue */
  const processAudioQueue = async () => {
    if (isProcessingQueue.value || audioQueue.value.length === 0) {
      return;
    }

    isProcessingQueue.value = true;
    isPlaying.value = true;

    while (audioQueue.value.length > 0) {
      const nextItem = audioQueue.value[0]; // Peek at the next item
      if (!nextItem) { // Should not happen if length > 0, but safety check
        audioQueue.value.shift(); // Remove invalid item
        continue;
      }

      const { buffer: pcmBuffer, rate: sampleRate } = nextItem;

      // Ensure AudioContext exists and matches the sample rate for this chunk
      const context = await ensureAudioContext(sampleRate);
      if (!context) {
        console.error(`Cannot play audio chunk, AudioContext unavailable for rate ${sampleRate}. Clearing queue.`);
        audioQueue.value = []; // Clear queue if context fails
        isProcessingQueue.value = false;
        isPlaying.value = false;
        currentSourceNode.value = null; // Clear tracked node
        return; // Stop processing
      }

      // Now that context is ready, dequeue the item
      audioQueue.value.shift();

      try {
        // --- PCM Int16 to Float32 Conversion and Playback ---
        const samples = pcmBuffer.byteLength / 2; // Assuming 16-bit PCM
        if (samples === 0) continue;

        const audioBuffer = context.createBuffer(1, samples, context.sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        const pcmView = new DataView(pcmBuffer);

        for (let i = 0; i < samples; i++) {
          const int16Sample = pcmView.getInt16(i * 2, true); // Little-endian
          channelData[i] = int16Sample / 32768.0;
        }

        const source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(context.destination); // Connect directly for now
        currentSourceNode.value = source; // <-- Track the new source

        const currentTime = context.currentTime;
        if (lastAudioTime.value < currentTime - 0.5) {
          console.warn('Playback head significantly behind, resetting schedule time.');
          lastAudioTime.value = currentTime;
        }
        const startTime = Math.max(currentTime, lastAudioTime.value);
        source.start(startTime);
        lastAudioTime.value = startTime + audioBuffer.duration;

        await new Promise<void>(resolve => {
          source.onended = () => {
            if (currentSourceNode.value === source) { // Only clear if it's the *current* node ending
              currentSourceNode.value = null;
            }
            resolve(); // Resolve the promise when this chunk ends
          };
        });

      } catch (e) {
        console.error('Error decoding or playing audio buffer:', e);
        error.value = `Playback error: ${e instanceof Error ? e.message : String(e)}`;
        currentSourceNode.value = null; // Clear on error

      }
      // Yield briefly
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    isProcessingQueue.value = false;
    if (audioQueue.value.length === 0 && !currentSourceNode.value) {
      isPlaying.value = false;
      console.log('Playback queue finished processing.');
    } };

  /** Cleans up the AudioContext */
  const cleanup = () => {
    stopPlayback();
    if (audioContext.value && audioContext.value.state !== 'closed') {
      audioContext.value.close()
        .then(() => console.log('Playback AudioContext closed.'))
        .catch(e => console.error('Error closing playback AudioContext:', e));
      audioContext.value = null;
    }
    audioQueue.value = [];
    isPlaying.value = false;
    isProcessingQueue.value = false;
    currentPlaybackRate.value = null;
  };

  /** Stop Current playback */

  const stopPlayback = () => {
    console.log('Stopping playback explicitly.');
    audioQueue.value = []; // Clear any pending audio chunks

    if (currentSourceNode.value) {
      try {
        console.log('Attempting to stop currently playing source node.');
        currentSourceNode.value.stop(); // Stop the currently playing sound
        currentSourceNode.value.disconnect(); // Disconnect it
      } catch (e) {
        // Ignore errors if stop() is called after node already finished
        if (!(e instanceof DOMException && e.name === 'InvalidStateError')) {
          console.warn('Error stopping source node:', e);
        }
      }
      currentSourceNode.value = null; // Clear tracked node
    }

    isProcessingQueue.value = false; // Ensure processing loop stops
    isPlaying.value = false; // Update playback status
  };
  return {
    isPlaying,
    error,
    addAudioChunk,
    stopPlayback,
    cleanup,
  };
}
