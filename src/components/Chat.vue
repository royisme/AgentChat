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
  import { marked } from 'marked'; // Import the markdown parser

  // API base URL from environment variables with fallback
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const access_token = import.meta.env.VITE_ACCESS_TOKEN
  const app_name = import.meta.env.VITE_APP_NAME || 'income_tax_agent';
  const agent_name = import.meta.env.VITE_AGENT_NAME || 'IncomeTaxAgent';
  const welcome_message = import.meta.env.VITE_WELCOME_MESSAGE || 'Welcome to the Income Tax Agent! How can I help you today?';

  console.log('access_token', access_token);

  // References
  const messagesDiv = ref<HTMLDivElement | null>(null);
  const messageInput = ref<HTMLInputElement | null>(null);
  const currentMessage = ref('');

  // Session data
  const appName = ref(app_name);
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
            'Authorization': `Bearer ${access_token}`,
          },
          body: JSON.stringify({
            state: {
              // Initial state can be set here if needed
            },
          }),
        }
      );

      if(response.status === 400){
        const data = await response.json();
        if (data.detail && data.detail.includes('Session already exists')) {
          console.log('Session already exists:', data.detail);
          return data;
        }
      }
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
            'Authorization': `Bearer ${access_token}`,
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

      return data;
    } catch (error) {
      console.error('Error sending query:', error);
      throw error;
    }
  };

  // Parse markdown text to HTML
  const parseMarkdown = (text: string): string => {
    try {
      // Configure marked for safe rendering
      marked.setOptions({
        breaks: true, // Add line breaks
        gfm: true, // GitHub Flavored Markdown
      });

      // Return parsed markdown - use marked.parse() with the sync option
      return marked.parse(text, { async: false }) as string;
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return text; // Return original text if parsing fails
    }
  };

  // Add a message to the messages div with Vuetify styling and markdown support
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

      // Parse markdown for agent messages, but not for user messages
      const messageHtml = sender !== 'You' ? parseMarkdown(message) : message;

      // Create content with inline styles to ensure color is applied
      const content = document.createElement('div');
      content.className = 'message-content';
      content.style.color = 'black'; // Apply color directly with inline style
      content.innerHTML = `
        <div class="text-subtitle-2 font-weight-medium" style="color: black;">${sender}</div>
        <div class="message-text" style="color: black;">${messageHtml}</div>
      `;

      // Assemble the message
      messageContainer.appendChild(avatar);
      messageContainer.appendChild(content);
      messageElement.appendChild(messageContainer);

      messagesDiv.value.appendChild(messageElement);
      messagesDiv.value.scrollTop = messagesDiv.value.scrollHeight;

      // Add syntax highlighting to code blocks if any
      if (sender !== 'You' && messageElement.querySelectorAll('pre code').length > 0) {
        // You could add a library like highlight.js here to enhance code blocks
        // For example: hljs.highlightAll();
      }
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
      addMessageToDiv(agent_name, 'Failed to send message. Please try again.');
    }
  };

  // Initialize the component
  onMounted(async () => {
    try {
      await createSession();
      console.log('Chat session initialized');

      // Add a welcome message
      addMessageToDiv(agent_name, welcome_message);

      // Focus the input field when the component is mounted
      if (messageInput.value) {
        messageInput.value.focus();
      }
    } catch (error) {
      console.error('Failed to initialize chat session:', error);
      addMessageToDiv(agent_name, 'Failed to initialize chat session. Please try again.');
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
  color: black !important;
}

.user-message .message-content {
  background-color: #e3f2fd;
}

.agent-message .message-content {
  background-color: #e8f5e9;
}

.message-text {
  white-space: pre-wrap;
  color: black !important;
}

.message-content div {
  color: black !important;
}

/* Markdown styling */
.message-text h1,
.message-text h2,
.message-text h3,
.message-text h4,
.message-text h5,
.message-text h6 {
  color: black !important;
  margin-top: 10px;
  margin-bottom: 5px;
}

.message-text p {
  margin-bottom: 8px;
}

.message-text ul,
.message-text ol {
  padding-left: 20px;
  margin-bottom: 8px;
}

.message-text code {
  background-color: rgba(0, 0, 0, 0.06);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.message-text pre {
  background-color: rgba(0, 0, 0, 0.06);
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  margin-bottom: 8px;
}

.message-text pre code {
  background-color: transparent;
  padding: 0;
}

.message-text a {
  color: #1976d2 !important;
  text-decoration: none;
}

.message-text a:hover {
  text-decoration: underline;
}

.message-text table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 8px;
}

.message-text th,
.message-text td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.message-text blockquote {
  border-left: 4px solid #ddd;
  padding-left: 10px;
  margin-left: 0;
  color: #666;
}
</style>
