<template>
  <h1>Agent Chat</h1>
  <div ref="messagesDiv" style="height: 300px; overflow-y: auto; border: 1px solid black" />
  <form @submit.prevent="handleSubmit">
    <label for="message">Message:</label>
    <input
      id="message"
      ref="messageInput"
      v-model="currentMessage"
      name="message"
      type="text"
    >
    <button type="submit">Send</button>
  </form>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue';

  // API base URL from environment variables with fallback
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // References
  const messagesDiv = ref<HTMLDivElement | null>(null);
  const messageInput = ref<HTMLInputElement | null>(null);
  const currentMessage = ref('');

  // Session data
  const appName = ref('income_tax_agent');
  const userId = ref('user_123');
  const sessionId = ref('s_123');
  const sessionState = ref({});

  // Response types
  interface MessagePart {
    text: string;
  }

  interface ChatResponse {
    content: {
      parts: MessagePart[];
      role: string;
    };
    invocation_id: string;
    author: string;
    id: string;
    timestamp: number;
  }

  // Create a new session for the user
  const createSession = async () => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/apps/${appName.value}/users/${userId.value}/sessions/${sessionId.value}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            state: {
              // Initial state can be set here if needed
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.status}`);
      }

      const data = await response.json();
      console.log('Session created successfully:', data);
      sessionState.value = data.state || {};

      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  // Send a query to the API
  const sendQuery = async (messageText: string): Promise<ChatResponse[]> => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/run`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            app_name: appName.value,
            user_id: userId.value,
            session_id: sessionId.value,
            new_message: {
              role: 'user',
              parts: [{ text: messageText }],
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send query: ${response.status}`);
      }

      const data = await response.json() as ChatResponse[];
      console.log('Query response:', data);

      return data;
    } catch (error) {
      console.error('Error sending query:', error);
      throw error;
    }
  };

  // Add a message to the messages div
  const addMessageToDiv = (sender: string, message: string) => {
    if (messagesDiv.value) {
      const messageElement = document.createElement('div');
      messageElement.className = 'message';
      messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
      messagesDiv.value.appendChild(messageElement);
      messagesDiv.value.scrollTop = messagesDiv.value.scrollHeight;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: Event) => {
    // Prevent the default form submission
    e.preventDefault();

    // Get the message from the input
    const message = currentMessage.value.trim();

    // If the message is empty, do nothing
    if (!message) return;

    try {
      // Display the user message in the UI
      addMessageToDiv('You', message);

      // Call the API to get a response
      const responseData = await sendQuery(message);

      // Process and display the agent's response
      if (responseData.length > 0) {
        const firstResponse = responseData[0];
        if (firstResponse.content.parts.length > 0) {
          const responseText = firstResponse.content.parts[0].text;
          const author = firstResponse.author || 'Agent';

          // Add the agent's response to the UI
          addMessageToDiv(author, responseText);
        }
      }

      // Clear the input field
      currentMessage.value = '';

      // Focus the input for the next message
      if (messageInput.value) {
        messageInput.value.focus();
      }
    } catch (error) {
      console.error('Error handling message submission:', error);
      // Optionally display an error message in the UI
      addMessageToDiv('System', 'Failed to send message. Please try again.');
    }
  };

  // Initialize the component
  onMounted(async () => {
    try {
      await createSession();
      console.log('Chat session initialized');

      // Focus the input field when the component is mounted
      if (messageInput.value) {
        messageInput.value.focus();
      }
    } catch (error) {
      console.error('Failed to initialize chat session:', error);
    }
  });
</script>

<style scoped>
.message {
  padding: 8px;
  margin: 4px;
  border-radius: 4px;
  background-color: #f5f5f5;
}
</style>
