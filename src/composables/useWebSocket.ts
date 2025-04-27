import { ref, type Ref } from 'vue';
import type { ChatMessage, ReceivedAudio,WebSocketPacket } from '@/types/chat'; // Adjust path if needed
import { arrayBufferToBase64, parseSampleRate } from '@/utils/helpers'; // Import helper

export function useWebSocket (url: string) {
  const ws: Ref<WebSocket | null> = ref(null);
  const isConnected: Ref<boolean> = ref(false);
  const messages: Ref<ChatMessage[]> = ref([]);
  const currentAgentMessageId: Ref<string | null> = ref(null);
  const error: Ref<string | null> = ref(null);

  const reconnectTimeout: Ref<ReturnType<typeof setTimeout> | null> = ref(null);
  const receivedAudio: Ref<ReceivedAudio | null> = ref(null);

  const connect = (): void => {
    if (reconnectTimeout.value) clearTimeout(reconnectTimeout.value);
    console.log(`Connecting to ${url}...`);

    // Clear state for new connection
    messages.value = [];
    error.value = null;
    isConnected.value = false;
    currentAgentMessageId.value = null;

    ws.value = new WebSocket(url);

    ws.value.onopen = () => {
      console.log('WebSocket connected.');
      isConnected.value = true;
      error.value = null;
      messages.value.push({ id: Date.now().toString(), text: 'Connection opened.', sender: 'system', type: 'system' });
    };

    ws.value.onmessage = (event: MessageEvent<string>) => {
      receivedAudio.value = null;
      try {
        const packet: WebSocketPacket = JSON.parse(event.data);
        console.log('Received packet:', packet);

        // --- Handle status updates ---
        if (packet.turn_complete) {
          if (currentAgentMessageId.value) {
            const msgIndex = messages.value.findIndex(m => m.id === currentAgentMessageId.value);
            if (msgIndex !== -1) messages.value[msgIndex].isComplete = true;
          }
          currentAgentMessageId.value = null;
          console.log('[TURN COMPLETE]');
          // Don't return yet, turn_complete might accompany final content
        }
        if (packet.interrupted) {
          currentAgentMessageId.value = null;
          messages.value.push({ id: Date.now().toString(),
            sender: 'system',
            text: '[Agent Interrupted]', type: 'system' });
          console.log('[INTERRUPTED]');
          // Don't return yet
        }

        // --- Handle Content (Text and Audio) ---
        if (packet.content && packet.content.parts && packet.content.parts.length > 0) {
          // Process all parts (though example only shows one)
          packet.content.parts.forEach(part => {
            // --- Handle Text Part ---
            if (part.text) {
              const text = part.text;
              if (!currentAgentMessageId.value) {
                const newId = `agent-${Date.now()}`;
                currentAgentMessageId.value = newId;
                messages.value.push({ id: newId, text, sender: 'agent', isComplete: packet.turn_complete }); // Mark complete if flag is present
              } else {
                const msgIndex = messages.value.findIndex(m => m.id === currentAgentMessageId.value);
                if (msgIndex !== -1) {
                  messages.value[msgIndex].text += text;
                  if (packet.turn_complete) messages.value[msgIndex].isComplete = true;
                } else {
                  console.warn('Agent message ID mismatch, creating new message.');
                  currentAgentMessageId.value = `agent-${Date.now()}`;
                  messages.value.push({ id: currentAgentMessageId.value, text, sender: 'agent', isComplete: packet.turn_complete });
                }
              }
            }
            // --- Handle Audio Part ---
            else if (part.inlineData && part.inlineData.mimeType?.startsWith('audio/')) {
              const base64Data = part.inlineData.data;
              const mimeType = part.inlineData.mimeType;
              const sampleRate = parseSampleRate(mimeType);

              if (base64Data && sampleRate) {
                console.log(`Received audio data chunk. Rate: ${sampleRate}, Size: ${base64Data.length} chars`);
                // Update the reactive ref with data and rate
                receivedAudio.value = { data: base64Data, rate: sampleRate };
              } else {
                console.warn('Received audio part but data or sample rate is missing/invalid.', part.inlineData);
              }
            }
            // Add handlers for other part types if necessary
          });
        }

        // If turn completed without content, reset ID
        if (packet.turn_complete && !packet.content) {
          currentAgentMessageId.value = null;
        }

      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error('Error processing message:', errorMessage, event.data);
        error.value = `Error processing message: ${errorMessage}`;
        messages.value.push({ id: Date.now().toString(),
          sender: 'system',
          text: `Error: ${errorMessage}`, type: 'error' });
      }
    };

    ws.value.onerror = (event: Event) => {
      console.error('WebSocket error:', event);
      isConnected.value = false;
      error.value = 'WebSocket error occurred.';
      messages.value.push({ id: Date.now().toString(),
        sender: 'system',
        text: 'Connection error.', type: 'error' });
    };

    ws.value.onclose = (event: CloseEvent) => {
      console.log('WebSocket closed.', `Code: ${event.code}`, `Reason: ${event.reason}`);
      isConnected.value = false;
      ws.value = null;
      currentAgentMessageId.value = null;
      messages.value.push({ id: Date.now().toString()
        , text: `Connection closed (${event.code}). Attempting to reconnect...`,
        sender: 'system', type: 'system' });

      // Don't reconnect if closed cleanly by client or server logic decided not to
      if (event.code !== 1000 && event.code !== 1005) {
        reconnectTimeout.value = setTimeout(connect, 5000); // Attempt reconnect
      } else {
        messages.value.push({ id: Date.now().toString(),sender:'system', text: 'Connection closed normally.', type: 'system' });
      }
    };
  };

  const sendMessage = (text: string): void => {
    if (ws.value && isConnected.value) {
      messages.value.push({ id: `user-${Date.now()}`, text, sender: 'user' });
      ws.value.send(text); // Backend expects plain text based on example
      console.log('Sent text:', text);
    } else {
      const msg = 'WebSocket not connected. Cannot send message.';
      console.warn(msg);
      error.value = msg;
      messages.value.push({ id: Date.now().toString(), text: msg, type: 'error', sender: 'system' });
    }
  };

  const sendAudioChunk = (audioData: Uint8Array): void => {
    if (ws.value && isConnected.value) {
      try {
        // 1. Encode Uint8Array PCM to Base64
        const base64String = arrayBufferToBase64(audioData.buffer);

        // 2. Create JSON payload (ASSUMPTION: key is 'audio_input')
        //    Verify the exact structure ADK expects!
        const payload = JSON.stringify({
          blob: {
            // We assume the data is PCM from our float32ToPCM helper
            mime_type: 'audio/pcm',
            // You could potentially pass the exact sample rate if needed,
            // e.g., "audio/pcm;rate=22000", but let's stick to basic PCM for now
            data: base64String,
          }, // Add other metadata if required by ADK
        });

        // 3. Send the JSON string
        ws.value.send(payload);
        // console.log(`Sent audio chunk: ${audioData.byteLength} bytes as Base64`);

      } catch (e) {
        const msg = `Error encoding/sending audio: ${e instanceof Error ? e.message : String(e)}`;
        console.error(msg);
        error.value = msg;
      }
    } else {
      const msg = 'WebSocket not connected. Cannot send audio.';
      console.warn(msg);
      error.value = msg;
    }
  };

  const disconnect = (): void => {
    if (reconnectTimeout.value) {
      clearTimeout(reconnectTimeout.value);
      reconnectTimeout.value = null;
    }
    if (ws.value) {
      console.log('Disconnecting WebSocket.');
      ws.value.close(1000, 'Client disconnected'); // Send a normal closure code
    }
  };

  // Return reactive state and methods
  return {
    isConnected,
    messages,
    error,
    connect,
    sendMessage,
    sendAudioChunk,
    receivedAudio,
    disconnect,
  };
}
