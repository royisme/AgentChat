<template>
  <v-container>
    <v-card class="mx-auto" elevation="2" max-width="800">
      <v-card-title class="d-flex align-center rounded-top">
        <v-icon class="mr-2" color="primary">mdi-chat</v-icon>
        Agent Chat (Hybrid: Fetch Text + WS Audio)
      </v-card-title>

      <v-card-text>
        <v-alert
          v-if="fetchError"
          class="mb-3"
          closable
          density="compact"
          type="error"
          variant="tonal"
        >
          Error: {{ fetchError }}
        </v-alert>
        <v-alert
          v-if="wsError"
          class="mb-3"
          closable
          density="compact"
          type="error"
          variant="tonal"
        >
          Audio Connection Error: {{ wsError }}
        </v-alert>
        <v-alert
          v-if="recorderError"
          class="mb-3"
          closable
          density="compact"
          type="warning"
          variant="tonal"
        >
          Recorder Error: {{ recorderError }}
        </v-alert>
        <v-alert
          v-if="playerError"
          class="mb-3"
          closable
          density="compact"
          type="warning"
          variant="tonal"
        >
          Player Error: {{ playerError }}
        </v-alert>

        <div ref="messagesDiv" class="chat-messages">
          <div
            v-for="msg in messages"
            :key="msg.id"
            :class="['message', getMessageClass(msg.sender)]"
          >
            <div class="message-container">
              <div v-if="msg.sender !== 'System'" :class="['message-avatar', 'mr-3', getAvatarClass(msg.sender)]">
                <span>{{ msg.sender.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="message-content">
                <div v-if="msg.sender !== 'System' && msg.sender !== 'You'" class="message-sender text-subtitle-2 font-weight-medium">
                  {{ msg.sender }}
                </div>
                <div
                  v-if="msg.sender === agentName && !msg.isAudioPlaceholder"
                  class="message-text"
                  :class="{ 'font-italic': msg.isAudioPlaceholder }"
                  v-html="parseMarkdown(msg.text)"
                />
                <div
                  v-else
                  class="message-text"
                  :class="{ 'font-italic': msg.isAudioPlaceholder }"
                >
                  {{ msg.text }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-form class="d-flex w-100 align-items-baseline" @submit.prevent="handleSubmit">
          <v-text-field
            ref="messageInput"
            v-model="currentMessage"
            append-inner-icon="mdi-send"
            class="mr-2"
            density="comfortable"
            :disabled="isSending || isConnectingWs"
            hide-details
            label="Message"
            variant="outlined"
            @click:append-inner="handleSubmit"
            @keydown.enter="handleSubmit"
          />

          <v-btn
            class="mr-2"
            :color="isRecording ? 'error' : 'secondary'"
            :disabled="isSending"
            icon
            :loading="isConnectingWs"
            :title="isRecording ? 'Stop Recording' : 'Start Recording'"
            @click="toggleRecording"
          >
            <v-icon>{{ isRecording ? 'mdi-microphone-off' : 'mdi-microphone' }}</v-icon>
          </v-btn>

        </v-form>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
  import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
  import { marked } from 'marked';
  import { useWebSocket } from '@/composables/useWebSocket';
  import { useAudioRecorder } from '@/composables/useAudioRecorder';
  import { useAudioPlayer } from '@/composables/useAudioPlayer';
  import type { ChatMessage, FetchChatResponse,ReceivedAudio } from '@/types/chat'; // Import relevant types
  import { useAuthStore } from '@/stores/auth';

  // --- Auth Store ---
  const authStore = useAuthStore();
  const currentUserId = computed(() => authStore.user?.id);
  const currentToken = computed(() => authStore.appToken);
  // --- Reactive State ---
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';


  // Session data
  const appName = import.meta.env.VITE_APP_NAME || 'income_tax_agent';
  const agentName = import.meta.env.VITE_AGENT_NAME || 'IncomeTaxAgent';
  const welcomeMessage = import.meta.env.VITE_WELCOME_MESSAGE || 'Welcome to the Income Tax Agent! How can I help you today?';
  const sessionId = ref(import.meta.env.VITE_SESSION_ID || `s_${Date.now()}`);

  const messagesDiv = ref<HTMLDivElement | null>(null); // Ref for the message container div
  const messageInput = ref<HTMLInputElement | null>(null); // Ref for the text input
  const currentMessage = ref(''); // v-model for the text input
  const fetchError = ref<string | null>(null);
  const isSending = ref(false); // For text message submission
  const isConnectingWs = ref(false); // For WebSocket connection status
  const wsError = ref<string | null>(null);
  const recorderError = ref<string | null>(null);
  const playerError = ref<string | null>(null);

  const messages = ref<ChatMessage[]>([]); // Reactive array to hold messages
  // *** END OF MODIFIED Message data management ***


  // --- WebSocket Setup ---
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  let hostname = '';
  let port = '';
  try {
    const parsedApiUrl = new URL(apiBaseUrl);
    hostname = parsedApiUrl.hostname;
    port = parsedApiUrl.port;
  } catch (e) {
    console.error('Invalid VITE_API_URL:', apiBaseUrl, e);
    hostname = 'localhost';
    port = '8000';
  }
  const wsBaseUrl = `${wsProtocol}//${hostname}${port ? ':' + port : ''}`;
  const wsUrl = computed(() => {
    if (!currentUserId.value || !currentToken.value) {
      return null;
    }
    //TODO: pass token is needed
    return `${wsBaseUrl}/run_live?app_name=${appName}&user_id=${currentUserId.value}&session_id=${sessionId.value}&token=${currentToken.value}`;
  });
  console.log('WebSocket URL:', wsUrl.value); // Debugging line
  // --- Composables ---
  const {
    isConnected,
    error: wsErrorComposable,
    receivedAudio,
    connect: connectWebSocket,
    sendAudioChunk,
    disconnect,
  } = useWebSocket(wsUrl.value || '');

  const {
    isRecording,
    error: recorderErrorComposable, // Rename
    startRecording,
    stopRecording,
  } = useAudioRecorder(handleAudioChunkCallback);

  const {
    error: playerErrorComposable, // Rename
    addAudioChunk: playReceivedAudioChunk,
    cleanup: cleanupPlayer,
  } = useAudioPlayer();

  // --- Watchers for Errors from Composables ---
  watch(wsErrorComposable, newVal => { wsError.value = newVal; });
  watch(recorderErrorComposable, newVal => { recorderError.value = newVal; });
  watch(playerErrorComposable, newVal => { playerError.value = newVal; });

  // --- API Calls & Logic ---
  const getAuthHeaders = () => {
    const token = currentToken.value; // Get current token from store
    if (!token) {
      console.error('Cannot make API call: No authentication token found.');
      throw new Error('Authentication required.');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };
  const createSession = async () => {
    fetchError.value = null;
    if (!currentUserId.value) {
      fetchError.value = 'User not loaded. Cannot create session.';
      console.error(fetchError.value);
      return;
    }
    try {
      const reqHeaders = getAuthHeaders();
      const response = await fetch(
        `${apiBaseUrl}/apps/${appName}/users/${currentUserId.value}/sessions/${sessionId.value}`,
        {
          method: 'POST',
          headers: reqHeaders,
          body: JSON.stringify({ state: {} }), // Simplified body
        }
      );
      if (response.status === 400) {
        const data = await response.json();
        if (data.detail?.includes('Session already exists')) {
          console.log('Session already exists.');
          return data;
        }
      }
      if (!response.ok) {
        throw new Error(`Failed: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Session ensured:', data);
      addMessage('System', welcomeMessage);
      return data;
    } catch (error: any) {
      console.error('Error ensuring session:', error);
      fetchError.value = `Session Error: ${error.message || 'Unknown error'}`;
    }
  };

  const sendQuery = async (messageText: string): Promise<void> => {
    if (isSending.value) return;
    if (!currentUserId.value) {
      fetchError.value = 'User not loaded. Cannot send query.';
      console.error(fetchError.value);
      addMessage('System', 'Error: User information not available.');
      return;
    }
    isSending.value = true;
    fetchError.value = null;
    try {
      await createSession(); // Ensure session if needed per message

      const reqHeaders = getAuthHeaders(); // Get current auth headers
      const response = await fetch(`${apiBaseUrl}/run`, {
        method: 'POST',
        headers: reqHeaders, // Use dynamic headers
        body: JSON.stringify({
          app_name: appName,
          user_id: currentUserId.value, // Use dynamic user ID
          session_id: sessionId.value,
          new_message: { role: 'user', parts: [{ text: messageText }] },
        }),
      });


      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json() as FetchChatResponse[];
      if (data.length > 0 && data[0].content?.parts?.length > 0) {
        addMessage(agentName, data[0].content.parts[0].text);
      }
    } catch (error: any) {
      console.error('Error sending query:', error);
      fetchError.value = `Send Error: ${error.message || 'Unknown error'}`;
      addMessage('System', `Error sending message: ${error.message || 'Please try again.'}`);
    } finally {
      isSending.value = false;
    }
  };

  // --- Shared Methods ---

  const parseMarkdown = (text: string): string => {
    try {
      marked.setOptions({ breaks: true, gfm: true });
      // Ensure it returns a string, handle potential non-string returns if necessary
      const parsed = marked.parse(text, { async: false });
      return typeof parsed === 'string' ? parsed : String(parsed);
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return text; // Return original text on error
    }
  };


  const addMessage = (sender: string, messageText: string, isAudioPlaceholder = false) => {
    console.log('Adding message from:', sender); // Keep for debugging
    const newMessage: ChatMessage = {
      id: Date.now() + Math.random().toString(36).substring(7), // Simple unique ID
      sender,
      text: messageText,
      isAudioPlaceholder,
      timestamp: Date.now(),
    };
    messages.value.push(newMessage);

    // Scroll to bottom after DOM updates
    nextTick(() => {
      if (messagesDiv.value) {
        messagesDiv.value.scrollTop = messagesDiv.value.scrollHeight;
      }
    });
  };
  // *** END OF MODIFIED addMessage ***


  // *** NEW: Helper functions for dynamic classes ***
  const getMessageClass = (sender: string): string => {
    if (sender === 'You') return 'user-message';
    if (sender === 'System') return 'system-message';
    // Default to agent for any other sender string
    return 'agent-message';
  };

  const getAvatarClass = (sender: string): string => {
    if (sender === 'You') return 'user-avatar';
    // Add more checks if needed for different avatar types
    return 'agent-avatar'; // Default to agent avatar
  };
  // *** END OF NEW Helper functions ***


  // Handle text form submission
  const handleSubmit = (e?: Event) => {
    if (e) e.preventDefault();
    if (isSending.value || isConnectingWs.value) return;

    const message = currentMessage.value.trim();
    if (!message) return;

    if (isRecording.value) {
      toggleRecording();
    }

    // *** MODIFIED: Use addMessage instead of addMessageToDiv ***
    addMessage('You', message);
    sendQuery(message); // Call API to get agent response

    currentMessage.value = '';
    // if (messageInput.value) { messageInput.value.focus(); } // Re-enable if needed
  };

  // --- Audio/WebSocket Specific Methods ---

  const connectAndStartAudio = async () => {
    if (wsUrl.value && !isConnected.value) { // Check if URL is valid and not already connected
      console.log('Attempting to connect audio WebSocket...');
      addMessage('System', 'Connecting for audio...');
      isConnectingWs.value = true;
      wsError.value = null;
      try {
        connectWebSocket(); // Call the connect method from the composable
        // Wait for connection or error (using watcher below is better)
        await new Promise<void>((resolve, reject) => {
          const stopWatcher = watch([isConnected, wsErrorComposable], ([conn, err]) => {
            if (conn) {
              console.log('WebSocket connected successfully via watcher.');
              stopWatcher(); resolve();
            } else if (err) {
              console.error('WebSocket connection failed via watcher:', err);
              stopWatcher(); reject(new Error(err));
            }
          }, { immediate: true }); // Check immediately

          // Timeout if connection takes too long
          setTimeout(() => {
            if (!isConnected.value && !wsErrorComposable.value) {
              console.log('WebSocket connection timed out.');
              stopWatcher();
              reject(new Error('WebSocket connection timed out (5s).'));
            }
          }, 5000);
        });

        isConnectingWs.value = false;
        console.log('Audio WebSocket connected. Starting recording...');
        addMessage('', 'Audio connection established. Recording...');
        await startRecording();

      } catch (err: any) {
        console.error('Failed to connect WebSocket or start recording:', err);
        isConnectingWs.value = false;
        wsError.value = err.message || 'Connection/Recording failed.';
        addMessage('System', `Failed to start audio: ${wsError.value}`);
        disconnect(); // Ensure cleanup
      }
    } else if (!wsUrl.value) {
      addMessage('System', 'Cannot connect audio: Authentication info missing.');
      console.warn('wsUrl is null, cannot connect.');
    } else {
      console.log('WebSocket already connected or connection attempt in progress.');
    }
  }

  const toggleRecording = async (): Promise<void> => {
    if (isSending.value) {
      addMessage('System', 'Please wait for the current message to send.');
      return;
    }

    if (isRecording.value) {
      console.log('Stopping recording...');
      addMessage('System', 'Stopping recording...');
      stopRecording();
      console.log('Disconnecting audio WebSocket...');
      disconnect(); // Disconnect WS when stopping recording
      addMessage('System', 'Recording stopped. Audio connection closed.');
    } else {
      // Attempt to connect and start
      await connectAndStartAudio();
    }
  };

  // Updated: Pass token if needed by backend inside the audio chunk message
  function handleAudioChunkCallback (audioData: Uint8Array) {
    if (isConnected.value && currentToken.value) {
      sendAudioChunk(audioData);

    } else {
      console.warn('Received audio chunk, but WebSocket disconnected or no token.');
      if (isRecording.value) {
        stopRecording();
        addMessage('System', 'Audio connection lost or invalid auth. Recording stopped.');
      }
    }
  }

  // --- Lifecycle & Watchers ---
  onMounted(async () => {
    console.log('Chat component mounted. Checking auth state...');
    // Wait for authentication to be ready before creating session or connecting WS
    if (authStore.isAuthenticated) {
      console.log('User is authenticated on mount.');
      await createSession();
    } else {
      console.log('User is not authenticated on mount.');
      // Watch for authentication changes if not authenticated initially
      const stopAuthWatcher = watch(() => authStore.isAuthenticated, async isAuth => {
        if (isAuth) {
          console.log('User became authenticated after mount.');
          await createSession();
          // Optionally connect WS here
          stopAuthWatcher(); // Stop watching once authenticated
        }
      });
    }

    if (messageInput.value) {
      messageInput.value.focus();
    }
  });

  onUnmounted(() => {
    if (isRecording.value) stopRecording();
    if (isConnected.value) disconnect();
    cleanupPlayer();
  });


  watch(receivedAudio, (newAudioInfo: ReceivedAudio | null) => {
    if (newAudioInfo && isConnected.value) {
      playReceivedAudioChunk(newAudioInfo);

    }
  });

  watch(wsError, newError => { // Watch the local wsError ref
    if (newError && isRecording.value) { // Check if recording when error occurs
      console.error('WebSocket error during recording:', newError);
      addMessage('System', `Audio connection error: ${newError}. Stopping recording.`);
      if (isRecording.value) stopRecording();
      disconnect();
      isConnectingWs.value = false; // Ensure loading state is reset
    }
  });

</script>

<style scoped lang="scss">
  /* Use theme variables for background and text color */
  .chat-messages {
    height: 400px; /* Or use calc(100vh - Xpx) for better responsiveness */
    overflow-y: auto;
    padding: 16px;
    background-color: rgb(var(--v-theme-surface)); /* Use surface color */
    color: rgb(var(--v-theme-on-surface)); /* Default text color */
    border-radius: 8px;
    display: flex;
    flex-direction: column;
  }

  .message {
    margin-bottom: 16px;
    display: flex;
    width: 100%;
  }

  /* Align messages */
  .user-message {
    align-self: flex-end;
    justify-content: flex-end;
  }
  .agent-message {
    align-self: flex-start;
    justify-content: flex-start;
  }
  .system-message {
    align-self: center; /* Center system messages */
    max-width: 100%;
  }


  .message-container {
    padding: 8px 12px;
    border-radius: 8px;
    min-width: 50px;       // Set a minimum width (adjust as needed)
    max-width: 75%;       // Set a maximum width (relative to parent .message)
    display: inline-block;  // Allows bubble to size to content horizontally
    text-align: left;     // Ensure text aligns left within the bubble
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
  }

  /* Common Avatar Styling */
  .message-avatar {
    flex-shrink: 0; /* Prevent avatar from shrinking */
    width: 36px;
    height: 36px;
    border-radius: 50%;
    color: white; /* Default text color for avatars */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    margin-bottom: 10px; /* Updated margin to bottom */
  }

  /* Specific Avatar Colors using Theme */
  .user-avatar {
    background-color: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
  }
  .agent-avatar {
    /* Use secondary or success color for agent */
    background-color: rgb(var(--v-theme-secondary));
    color: rgb(var(--v-theme-on-secondary)); /* Ensure contrast */
  }

  /* User Message Content Bubble */
  .user-message .message-content {
    background-color: rgb(var(--v-theme-surface-variant)); // Use a theme surface variant color
    color: rgb(var(--v-theme-on-surface-variant)); // Use corresponding text color for readability
    border-bottom-right-radius: 0px; // Pointy corner
    border-bottom-left-radius: 8px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }


  /* Agent Message Content Bubble */
  .agent-message .message-content {
    background-color: rgba(var(--v-theme-on-surface), 0.08);
    color: rgb(var(--v-theme-on-surface));
    border-bottom-left-radius: 0px; // Pointy corner
    border-bottom-right-radius: 8px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;

  }


  /* System Message Styling */
  .system-message .message-container {
    justify-content: center; /* Center system text */
  }
  .system-message .message-content {
    padding: 0; /* No bubble background */
    background-color: transparent !important;
  }
  .system-message .message-text {
    font-style: italic;
    color: rgba(var(--v-theme-on-surface), var(--v-disabled-opacity)); /* Dimmed color */
    text-align: center;
    font-size: 0.9em;
  }


  /* General Content Styling */
  .message-content {
    padding: 8px 12px;
    border-radius: 8px;
  }

  .message-sender {
    margin-bottom: 2px; /* Small space between sender and text */
  }

  .message-text {
    white-space: pre-wrap; /* Keep line breaks */
    word-wrap: break-word; /* Break long words */
    line-height: 1.4;
  }

  .message-text :deep(h1),
  .message-text :deep(h2),
  .message-text :deep(h3),
  .message-text :deep(h4),
  .message-text :deep(h5),
  .message-text :deep(h6) {
    color: inherit !important;
    margin-top: 12px;
    margin-bottom: 6px;
    line-height: 1.2;
  }
  .message-text :deep(p) {
    margin-bottom: 8px;
    color: inherit !important;
  }
  .message-text :deep(ul),
  .message-text :deep(ol) {
    padding-left: 20px;
    margin-bottom: 8px;
    color: inherit !important;
  }
  .message-text :deep(code) {
    background-color: rgba(var(--v-theme-on-surface), 0.1);
    padding: 2px 5px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.9em;
    color: inherit !important;
  }
  .message-text :deep(pre) {
    background-color: rgba(var(--v-theme-on-surface), 0.1);
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    margin-bottom: 8px;
  }
  .message-text :deep(pre code) {
    background-color: transparent;
    padding: 0;
    font-size: 1em;
    color: inherit !important;
  }
  .message-text :deep(a) {
    color: rgb(var(--v-theme-primary)) !important;
    text-decoration: none;
    font-weight: 500;
  }
  .message-text :deep(a:hover) {
    text-decoration: underline;
  }
  .message-text :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 10px;
  }
  .message-text :deep(th),
  .message-text :deep(td) {
    border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
    padding: 8px 10px;
    text-align: left;
    color: inherit !important;
  }
  .message-text :deep(blockquote) {
    border-left: 4px solid rgba(var(--v-theme-on-surface), 0.2);
    padding-left: 12px;
    margin-left: 0;
    margin-top: 8px;
    margin-bottom: 8px;
    color: rgba(var(--v-theme-on-surface), 0.8) !important;
  }

  /* Italic style for audio placeholder */
  .font-italic {
      font-style: italic;
  }
</style>
