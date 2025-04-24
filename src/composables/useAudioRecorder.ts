// src/composables/useAudioRecorder.ts
import { ref, type Ref } from 'vue';
import type { AudioChunkCallback } from '@/types/chat';
import { float32ToPCM } from '@/utils/helpers'; // Import the helper

// --- Configuration ---
// Path to the AudioWorklet processor script in the 'public' folder
const AUDIO_PROCESSOR_PATH = '/assets/AudioProcessor.js';
const AUDIO_PROCESSOR_NAME = 'audio-processor';

export function useAudioRecorder(onChunkCallback: AudioChunkCallback) {
  const isRecording: Ref<boolean> = ref(false);
  const error: Ref<string | null> = ref(null);

  // Refs for managing audio resources
  const audioContext: Ref<AudioContext | null> = ref(null);
  const mediaStreamSource: Ref<MediaStreamAudioSourceNode | null> = ref(null);
  const workletNode: Ref<AudioWorkletNode | null> = ref(null);
  const mediaStream: Ref<MediaStream | null> = ref(null);

  /** Initializes AudioContext if not already created */
  const initializeAudioContext = () => {
    if (!audioContext.value) {
      try {
        // Using default sample rate; processor handles resampling to target
        audioContext.value = new AudioContext();
        // Resume context if suspended (often needed after user interaction)
        if (audioContext.value.state === 'suspended') {
          audioContext.value.resume();
        }
      } catch (e) {
        console.error('Error creating AudioContext:', e);
        error.value = 'AudioContext not supported or could not be created.';
        throw e; // Re-throw to indicate failure
      }
    }
    return audioContext.value;
  };

  /** Set up the audio processing pipeline */
  const setupAudioProcessing = async (stream: MediaStream) => {
    const context = initializeAudioContext();
    if (!context) return; // Exit if context failed

    // Resume context if it's suspended (important for user gesture requirement)
    if (context.state === 'suspended') {
      await context.resume();
    }

    try {
      // Load the AudioWorklet processor
      console.log(`Loading AudioWorklet module from ${AUDIO_PROCESSOR_PATH}`);
      await context.audioWorklet.addModule(AUDIO_PROCESSOR_PATH);
      console.log('AudioWorklet module loaded.');

      // Create nodes
      mediaStreamSource.value = context.createMediaStreamSource(stream);
      workletNode.value = new AudioWorkletNode(context, AUDIO_PROCESSOR_NAME);

      // Handle messages (processed audio chunks) from the worklet
      workletNode.value.port.onmessage = (event: MessageEvent<Float32Array>) => {
        const float32Chunk = event.data;
        if (float32Chunk && float32Chunk.length > 0) {
          // Convert the Float32Array chunk to PCM Uint8Array
          const pcmChunk = float32ToPCM(float32Chunk);
          // Send the PCM chunk via the callback provided by the component
          onChunkCallback(pcmChunk);
        }
      };

      workletNode.value.port.addEventListener('error', (ev: Event) => {
        console.error('Error message received from worklet port:', ev);
        error.value = 'Error in audio processing worklet.';
      });

      // Connect the audio graph: Mic Source -> Worklet Processor
      mediaStreamSource.value.connect(workletNode.value);
      // Not connecting to destination as we only need the processed data via port

      console.log('Audio processing pipeline connected.');

    } catch (err) {
      console.error('Error setting up AudioWorklet processing:', err);
      error.value = `Failed to setup audio processor: ${err instanceof Error ? err.message : String(err)}`;
      // Cleanup partially created resources if necessary
      stopRecording(); // Attempt cleanup
      throw err; // Re-throw
    }
  };

  /** Starts the audio recording process */
  const startRecording = async () => {
    if (isRecording.value) {
      console.warn('Recording is already in progress.');
      return;
    }
    error.value = null; // Clear previous errors

    try {
      // Request microphone access
      mediaStream.value = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      console.log('Microphone access granted.');

      // Set up the audio processing pipeline with the new stream
      await setupAudioProcessing(mediaStream.value);

      isRecording.value = true;
      console.log('Recording started.');

    } catch (err) {
      console.error('Failed to start recording:', err);
      // Handle specific errors (NotAllowedError, NotFoundError, etc.)
      if (err instanceof Error && err.name === 'NotAllowedError') {
        error.value = 'Microphone permission denied. Please allow access.';
      } else if (err instanceof Error && err.name === 'NotFoundError') {
        error.value = 'No microphone found.';
      } else {
        error.value = `Could not start recording: ${err instanceof Error ? err.message : String(err)}`;
      }
      // Ensure cleanup if setup failed partially
      stopRecording();
    }
  };

  /** Stops the audio recording and cleans up resources */
  const stopRecording = () => {
    if (!isRecording.value && !mediaStream.value && !audioContext.value) {
      // Nothing to stop if not recording and resources are already clean
      // console.log("Nothing to stop.");
      return;
    }
    console.log('Stopping recording and cleaning up resources...');

    // Stop microphone tracks
    if (mediaStream.value) {
      mediaStream.value.getTracks().forEach(track => track.stop());
      mediaStream.value = null;
      console.log('MediaStream tracks stopped.');
    }

    // Disconnect audio nodes
    if (mediaStreamSource.value) {
      mediaStreamSource.value.disconnect();
      mediaStreamSource.value = null;
    }
    if (workletNode.value) {
      // Close the message port before disconnecting if possible? (Check API)
      // workletNode.value.port.close(); // May not be needed or available
      workletNode.value.disconnect();
      workletNode.value = null;
      console.log('Worklet node disconnected.');
    }

    // Close AudioContext (consider if it should be reused)
    // Closing is good practice for resource management if not needed immediately after.
    if (audioContext.value && audioContext.value.state !== 'closed') {
      audioContext.value.close()
        .then(() => console.log('AudioContext closed.'))
        .catch(e => console.error('Error closing AudioContext:', e));
      audioContext.value = null;
    }

    isRecording.value = false;
    console.log('Recording stopped.');
  };

  return {
    isRecording,
    error,
    startRecording,
    stopRecording,
  };
}
