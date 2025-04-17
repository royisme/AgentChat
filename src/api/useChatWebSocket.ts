import { onBeforeUnmount, onMounted, ref } from 'vue';

export function useChatWebSocket () {
  // Reactive references
  const messagesDiv = ref<HTMLDivElement | null>(null);
  const messageInput = ref<HTMLInputElement | null>(null);
  const messageText = ref('');
  const isConnected = ref(false);
  let currentMessageId: string | null = null;
  let ws: WebSocket | null = null;

  // Get WebSocket URL from environment variables
  const sessionId = Math.random().toString().substring(10);
  const baseWsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
  const ws_url = `${baseWsUrl}/ws/${sessionId}`;

  // WebSocket handlers
  function setupWebSocket () {
    ws = new WebSocket(ws_url);

    ws.onopen = function () {
      console.log('WebSocket connection opened.');
      isConnected.value = true;
      if (messagesDiv.value) {
        messagesDiv.value.textContent = 'Connection opened';
      }
    };

    ws.onmessage = function (event) {
      // Parse the incoming message
      const packet = JSON.parse(event.data);
      console.log(packet);

      if (!messagesDiv.value) return;

      // Check if the turn is complete
      // if turn complete, add new message
      if (packet.turn_complete && packet.turn_complete === true) {
        currentMessageId = null;
        return;
      }

      // add a new message for a new turn
      if (currentMessageId === null) {
        currentMessageId = Math.random().toString(36).substring(7);
        const message = document.createElement('p');
        message.id = currentMessageId;
        // Append the message element to the messagesDiv
        messagesDiv.value.appendChild(message);
      }

      // Add message text to the existing message element
      const message = document.getElementById(currentMessageId);
      if (message) {
        message.textContent += packet.message;
      }

      // Scroll down to the bottom of the messagesDiv
      messagesDiv.value.scrollTop = messagesDiv.value.scrollHeight;
    };

    // When the connection is closed, try reconnecting
    ws.onclose = function () {
      console.log('WebSocket connection closed.');
      isConnected.value = false;
      if (messagesDiv.value) {
        messagesDiv.value.textContent = 'Connection closed';
      }
      setTimeout(setupWebSocket, 5000);
    };

    ws.onerror = function (e) {
      console.log('WebSocket error: ', e);
      isConnected.value = false;
    };
  }

  // Send message function
  function sendMessage () {
    if (!ws || ws.readyState !== WebSocket.OPEN || !messageText.value) return;

    if (messagesDiv.value) {
      const p = document.createElement('p');
      p.textContent = '> ' + messageText.value;
      messagesDiv.value.appendChild(p);
      ws.send(messageText.value);
      messageText.value = '';
    }
  }

  // Setup and cleanup
  onMounted(() => {
    setupWebSocket();
  });

  onBeforeUnmount(() => {
    // Clean up WebSocket connection when component is destroyed
    if (ws) {
      ws.close();
    }
  });

  return {
    messagesDiv,
    messageInput,
    messageText,
    isConnected,
    sendMessage,
  };
}
