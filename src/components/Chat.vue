<template>
  <v-container>
    <v-card class="mx-auto" elevation="2" max-width="800">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-chat</v-icon>
        Agent Chat
      </v-card-title>

      <v-card-text>
        <div
          ref="messagesDiv"
          class="chat-messages"
        >
          <!-- Messages will be added here dynamically -->
        </div>
      </v-card-text>

      <v-card-actions>
        <v-form class="d-flex w-100" @submit.prevent="handleSubmit">
          <v-text-field
            ref="messageInput"
            v-model="currentMessage"
            append-inner-icon="mdi-send"
            class="mr-2"
            density="comfortable"
            hide-details
            label="Message"
            variant="outlined"
            @click:append-inner="handleSubmit"
          />

          <v-btn
            color="primary"
            :disabled="!currentMessage.trim()"
            type="submit"
          >
            Send
          </v-btn>
        </v-form>
      </v-card-actions>
    </v-card>
  </v-container>
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

  // Add a message to the messages div with Vuetify styling
  const addMessageToDiv = (sender: string, message: string) => {
    if (messagesDiv.value) {
      const messageElement = document.createElement('div');
      messageElement.className = 'message ' + (sender === 'You' ? 'user-message' : 'agent-message');

      // Create message container with Vuetify-like styling
      const messageContainer = document.createElement('div');
      messageContainer.className = 'd-flex message-container';

      // Create avatar
      const avatar = document.createElement('div');
      avatar.className = 'message-avatar mr-3';
      avatar.innerHTML = `
        <div class="v-avatar" style="background-color: ${sender === 'You' ? '#1976d2' : '#4caf50'}; color: white; height: 36px; width: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
          <span>${sender.charAt(0)}</span>
        </div>
      `;

      // Create content with inline styles to ensure color is applied
      const content = document.createElement('div');
      content.className = 'message-content';
      content.style.color = 'black'; // Apply color directly with inline style
      content.innerHTML = `
        <div class="text-subtitle-2 font-weight-medium" style="color: black;">${sender}</div>
        <div class="message-text" style="color: black;">${message}</div>
      `;

      // Assemble the message
      messageContainer.appendChild(avatar);
      messageContainer.appendChild(content);
      messageElement.appendChild(messageContainer);

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

      // Add a welcome message
      addMessageToDiv('IncomeTaxAgent', 'Welcome to the Income Tax Agent! How can I help you today?');

      // Focus the input field when the component is mounted
      if (messageInput.value) {
        messageInput.value.focus();
      }
    } catch (error) {
      console.error('Failed to initialize chat session:', error);
      addMessageToDiv('System', 'Failed to initialize chat session. Please try again.');
    }
  });
</script>

<style scoped>
.chat-messages {
  height: 400px;
  overflow-y: auto;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.message {
  margin-bottom: 16px;
}

.message-container {
  display: flex;
  align-items: flex-start;
}

.message-content {
  padding: 8px 12px;
  border-radius: 8px;
  max-width: 80%;
  color: black !important; /* Added !important to override any other styles */
}

.user-message .message-content {
  background-color: #e3f2fd;
}

.agent-message .message-content {
  background-color: #e8f5e9;
}

.message-text {
  white-space: pre-wrap;
  color: black !important; /* Added !important to ensure text color */
}

/* Add a more specific selector to ensure color is applied */
.message-content div {
  color: black !important;
}
</style>
