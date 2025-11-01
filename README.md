# FAQ Chatbot SDK

A React SDK widget component for integrating an AI chatbot into any React application. The widget appears as a floating button in the bottom right corner and opens as a modal chat interface with automatic CSS injection, session management, and full customization options.

## Installation

```bash
npm install faq-chatbot
```

or

```bash
yarn add faq-chatbot
```

or

```bash
pnpm add faq-chatbot
```

## Quick Start

```tsx
import { Widget } from "faq-chatbot";

function App() {
  return <Widget baseUrl="https://your-api-domain.com" />;
}
```

**That's it!** CSS is automatically injected - no need to import stylesheets separately.

## Integration Guide

### Step 1: Install the Package

```bash
npm install faq-chatbot
```

### Step 2: Import and Use the Widget

```tsx
import { Widget } from "faq-chatbot";

function App() {
  return (
    <>
      {/* Your application content */}
      <div>
        <h1>My Application</h1>
        {/* Your app components */}
      </div>

      {/* Add the widget anywhere in your component tree */}
      <Widget baseUrl="https://api.yourdomain.com" />
    </>
  );
}
```

### Step 3: Configure Your API Endpoint

The widget requires a backend API that follows the FAQ Chatbot API specification. Ensure your API has:

- **POST** `/ask` endpoint that accepts:
  ```json
  {
    "question": "Your question here",
    "session_id": "optional-session-id"
  }
  ```
- Returns responses in this format:
  ```json
  {
    "status": true,
    "code": "00",
    "message": "Response retrieved successfully",
    "data": {
      "answer": "AI-generated answer",
      "follow_up_question": "Would you like to know more?",
      "conversation_id": 123,
      "session_id": "abc12345"
    }
  }
  ```

## Usage Examples

### Basic Example

```tsx
import { Widget } from "faq-chatbot";

function App() {
  return <Widget baseUrl="http://localhost:8080" />;
}
```

### Customized Example

```tsx
import { Widget } from "faq-chatbot";

function App() {
  return (
    <Widget
      baseUrl="https://api.example.com"
      welcomeMessage="Hi! Welcome to our support chat. How can I help you?"
      primaryColor="#3B82F6"
      secondaryColor="#2563EB"
      textSize="base"
      buttonText="Need Help?"
      title="Customer Support"
      subtitle="We're here to help!"
      inputPlaceholder="Ask us anything..."
      typewriterSpeed={30}
      onInit={() => console.log("Chat widget loaded!")}
    />
  );
}
```

### Advanced Customization

```tsx
import { Widget } from "faq-chatbot";

function App() {
  return (
    <Widget
      baseUrl={import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}
      welcomeMessage="Welcome! I'm here to help answer your questions. What would you like to know?"
      primaryColor="purple-600" // Tailwind class
      secondaryColor="#7C3AED" // Hex color
      textSize="lg"
      buttonText="Chat with us"
      title="AI Assistant"
      subtitle="Ask me anything!"
      inputPlaceholder="Type your question here..."
      sendButtonText="Send"
      emptyStateMessage="Start a conversation by asking a question!"
      typewriterSpeed={50}
      sessionStorageKey="my-custom-session-key"
      className="my-custom-widget"
      onInit={() => {
        console.log("Widget initialized");
        // Track analytics, etc.
      }}
    />
  );
}
```

## Props Reference

| Prop                | Type                             | Required | Default                                        | Description                                                                                                                     |
| ------------------- | -------------------------------- | -------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `baseUrl`           | `string`                         | **Yes**  | -                                              | Base URL of your QA API (e.g., `"https://api.example.com"` or `"http://localhost:8080"`)                                        |
| `apiKey`            | `string`                         | No       | -                                              | API key for authentication (reserved for future use)                                                                            |
| `welcomeMessage`    | `string`                         | No       | `"Hello! How can I help you today?"`           | Message displayed when the chat is first opened                                                                                 |
| `primaryColor`      | `string`                         | No       | `"blue-600"`                                   | Primary color for buttons, header, and accents. Can be a Tailwind class (e.g., `"purple-600"`) or hex color (e.g., `"#8B5CF6"`) |
| `secondaryColor`    | `string`                         | No       | `"blue-700"`                                   | Secondary color for hover states and accents. Same format as `primaryColor`                                                     |
| `textSize`          | `"sm" \| "base" \| "lg" \| "xl"` | No       | `"base"`                                       | Base text size for the entire widget                                                                                            |
| `buttonText`        | `string`                         | No       | `"Chat with us"`                               | Text displayed on the floating chat button                                                                                      |
| `typewriterSpeed`   | `number`                         | No       | `30`                                           | Speed of typewriter effect in milliseconds per character. Set to `0` to disable the effect                                      |
| `title`             | `string`                         | No       | `"AI Assistant"`                               | Title text displayed in the chat header                                                                                         |
| `subtitle`          | `string`                         | No       | `"Ask me anything!"`                           | Subtitle text displayed in the chat header                                                                                      |
| `inputPlaceholder`  | `string`                         | No       | `"Type your question..."`                      | Placeholder text for the message input field                                                                                    |
| `sendButtonText`    | `string`                         | No       | `"Send"`                                       | Text for the send button (accessibility label)                                                                                  |
| `emptyStateMessage` | `string`                         | No       | `"Start a conversation by asking a question!"` | Message shown when chat has no messages                                                                                         |
| `className`         | `string`                         | No       | `""`                                           | Additional CSS class name to apply to the widget container                                                                      |
| `sessionStorageKey` | `string`                         | No       | `"chat-widget-session"`                        | localStorage key used for session persistence                                                                                   |
| `onInit`            | `() => void`                     | No       | -                                              | Callback function called when the widget finishes initializing                                                                  |

## Features

- 🚀 **Zero Configuration CSS** - Styles are automatically injected, no CSS import needed
- 💬 **Full Chat Interface** - Complete chat UI with message history and conversation management
- ✨ **Typewriter Effect** - Assistant messages appear with a smooth typewriter animation (customizable speed)
- 🎨 **Modal Design** - Opens as a modal from a floating button positioned at bottom right
- 🎨 **Fully Customizable** - Colors, text, sizes, and all UI strings can be customized
- 📝 **Welcome Message** - Customizable welcome message displayed when chat opens
- 📏 **Text Sizing** - Adjustable text size (sm, base, lg, xl) for better accessibility
- 🔄 **Session Management** - Automatic session handling with localStorage persistence
- 📝 **Follow-up Questions** - Clickable follow-up question suggestions within messages
- ⚡ **Loading States** - Visual feedback during API calls with loading indicators
- 🔒 **Error Handling** - Graceful error messages and recovery with user-friendly error display
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- 🎯 **TypeScript Support** - Full TypeScript definitions included for type safety
- 🔐 **Session Persistence** - Chat history persists across page reloads
- 🎭 **Smooth Animations** - Modal open/close animations for better user experience

## Color Customization

You can use either Tailwind color classes or hex colors for `primaryColor` and `secondaryColor`:

### Using Tailwind Color Classes

```tsx
<Widget
  baseUrl="http://localhost:8080"
  primaryColor="purple-600"
  secondaryColor="purple-700"
/>
```

### Using Hex Colors

```tsx
<Widget
  baseUrl="http://localhost:8080"
  primaryColor="#8B5CF6"
  secondaryColor="#7C3AED"
/>
```

**Note:** When using hex colors, the widget will apply them as inline styles. When using Tailwind classes, ensure Tailwind CSS is available in your project (it's already included in the widget's CSS).

## Advanced Usage

### Using the API Client Directly

For advanced use cases, you can use the API client directly to build custom implementations:

```tsx
import { ChatAPIClient } from "faq-chatbot";

const client = new ChatAPIClient("http://localhost:8080");

// Ask a question
const response = await client.askQuestion(
  "What can you help me with?",
  "session-id-optional"
);

if (response.status) {
  console.log(response.data.answer);
  console.log(response.data.follow_up_question);
  console.log(response.data.session_id);
}
```

### Available API Client Methods

```tsx
import { ChatAPIClient } from "faq-chatbot";

const client = new ChatAPIClient("https://api.example.com");

// Ask a question
const response = await client.askQuestion(question, sessionId?);

// Get session information
const sessionInfo = await client.getSessionInfo(sessionId);

// Health check
const health = await client.healthCheck();
```

### TypeScript Types

You can import TypeScript types for building custom implementations:

```tsx
import type {
  ChatMessage,
  ChatWidgetConfig,
  ApiResponse,
  AskQuestionResponse,
  Conversation,
  SessionInfo,
} from "faq-chatbot";

// Use types in your custom components
const message: ChatMessage = {
  id: "1",
  type: "user",
  content: "Hello!",
  timestamp: new Date(),
};
```

### Environment Variables

You can use environment variables for configuration:

```tsx
// .env
VITE_API_BASE_URL=https://api.example.com
```

```tsx
import { Widget } from "faq-chatbot";

function App() {
  return (
    <Widget
      baseUrl={import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}
    />
  );
}
```

## API Requirements

The widget expects a backend API that implements the FAQ Chatbot API specification. Your API should provide:

### Required Endpoints

#### 1. POST `/ask`

Ask a question and receive an AI-generated answer.

**Request:**

```json
{
  "question": "What is your return policy?",
  "session_id": "optional-session-id"
}
```

**Success Response (200 OK):**

```json
{
  "status": true,
  "code": "00",
  "message": "Response retrieved successfully",
  "data": {
    "answer": "Our return policy allows returns within 30 days of purchase...",
    "follow_up_question": "Would you like to know more about our shipping options?",
    "conversation_id": 73,
    "session_id": "HZ7PlNgb"
  }
}
```

**Error Response (200 OK):**

```json
{
  "status": false,
  "code": "01",
  "message": "Question cannot be empty",
  "data": {}
}
```

#### 2. GET `/session/{session_id}` (Optional)

Get information about a conversation session.

**Success Response:**

```json
{
  "status": true,
  "code": "00",
  "data": {
    "session_id": "HZ7PlNgb",
    "last_activity": "2025-10-31T15:12:02.889Z",
    "time_remaining_seconds": 720,
    "has_previous_conversation": true,
    "follow_up_question": "Would you like to know more?"
  }
}
```

#### 3. GET `/` (Optional)

Health check endpoint.

### API Response Format

All endpoints should return responses in this standardized format:

```typescript
{
  status: boolean; // true for success, false for failure
  code: string; // "00" for success, "01" for failure
  message: string; // Human-readable message
  data: object; // Response data or {} for errors
}
```

### Session Management

- Sessions are automatically created on the first question
- Session IDs are 8-character strings
- Sessions expire after 15 minutes of inactivity
- The widget automatically includes `session_id` in subsequent requests within the same session

## Session Management

The widget automatically:

- Creates a session on the first question
- Stores the session ID in localStorage
- Maintains conversation context across page reloads
- Clears session when the chat is cleared

Sessions expire after 15 minutes of inactivity (as per API specification).

## Development

This project is configured as a library using Vite's library mode. The build process:

1. Generates TypeScript declaration files (`.d.ts`)
2. Builds both ES modules (`.mjs`) and CommonJS (`.cjs`) formats
3. Bundles CSS into a single `style.css` file

### Build Commands

```bash
# Build the library
npm run build

# Generate TypeScript declarations only
npm run build:types

# Development server (for testing with demo app)
npm run dev

# Lint code
npm run lint
```

### Project Structure

```
src/
  components/
    Widget.tsx       # Main chat widget component
  utils/
    api.ts           # API client implementation
  types/
    api.ts           # API type definitions
    chat.ts          # Chat widget type definitions
  index.ts           # Library entry point
  index.css          # Styles (Tailwind CSS)
```

### Building for Production

Before publishing to npm:

1. Update the version in `package.json`
2. Run `npm run build` to generate the distribution files
3. The `dist/` folder will contain:
   - `index.mjs` - ES module build
   - `index.cjs` - CommonJS build
   - `index.d.ts` - TypeScript declarations
   - `style.css` - Bundled CSS styles (includes Tailwind)

## Styling

### Automatic CSS Injection

**No CSS import needed!** The widget automatically injects its CSS when you import the component. Just import and use:

```tsx
import { Widget } from "faq-chatbot";

function App() {
  return <Widget baseUrl="http://localhost:8080" />;
}
```

### Optional: Manual CSS Import

If you need more control over CSS loading order or want to use your own CSS bundler, you can manually import the CSS:

```tsx
import { Widget } from "faq-chatbot";
import "faq-chatbot/style.css"; // Optional - CSS is auto-injected by default
```

### Custom Styling

#### Using the `className` Prop

Add custom CSS classes:

```tsx
<Widget baseUrl="http://localhost:8080" className="my-custom-widget" />
```

#### Overriding Widget Styles

You can override widget styles by targeting its CSS classes:

```css
/* Target the chat widget container */
.chat-widget {
  /* Your custom styles */
}

/* Target the floating button */
.chat-widget-button {
  /* Custom button styles */
}

/* Target the modal */
.chat-modal {
  /* Custom modal styles */
}

/* Target message bubbles */
.message-bubble {
  /* Custom message styles */
}
```

#### Using CSS Variables (for hex colors)

When you provide hex colors via props, the widget uses CSS variables that you can override:

```css
:root {
  --primary-color: #your-color;
  --secondary-color: #your-other-color;
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Peer Dependencies

This library requires React 18+ or 19+ to be installed in your project. React is listed as a peer dependency to avoid version conflicts.

## Common Use Cases

### Customer Support Chat

```tsx
<Widget
  baseUrl="https://api.example.com"
  title="Customer Support"
  subtitle="We're here to help!"
  buttonText="Need Help?"
  welcomeMessage="Hi! How can we assist you today?"
  primaryColor="#007bff"
  secondaryColor="#0056b3"
/>
```

### Product FAQ Bot

```tsx
<Widget
  baseUrl="https://api.example.com"
  title="Product Assistant"
  subtitle="Ask about our products"
  buttonText="Ask a Question"
  welcomeMessage="Welcome! I can answer questions about our products."
  primaryColor="purple-600"
  textSize="lg"
  typewriterSpeed={20}
/>
```

### Educational Q&A

```tsx
<Widget
  baseUrl="https://api.example.com"
  title="Study Assistant"
  subtitle="Get help with your studies"
  buttonText="Ask Tutor"
  welcomeMessage="Hello! I'm here to help with your questions."
  primaryColor="#4caf50"
  secondaryColor="#45a049"
  inputPlaceholder="What would you like to learn?"
/>
```

## Troubleshooting

### Widget Not Appearing

- Ensure React 18+ or 19+ is installed
- Check that the `baseUrl` prop is correctly set
- Verify your API endpoint is accessible (check CORS settings)

### Styles Not Loading

- CSS is automatically injected - no manual import needed
- If styles are missing, try manually importing: `import "faq-chatbot/style.css"`
- Check browser console for any CSS loading errors

### API Connection Issues

- Verify your `baseUrl` is correct and accessible
- Check CORS settings on your API server
- Ensure your API follows the required response format
- Check browser network tab for failed requests

### Session Not Persisting

- Check browser localStorage permissions
- Verify `sessionStorageKey` is not conflicting with other keys
- Clear browser cache/localStorage if sessions are corrupted

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Peer Dependencies

This library requires:

- **React**: `^18.0.0 || ^19.0.0`
- **React-DOM**: `^18.0.0 || ^19.0.0`

These are listed as peer dependencies to avoid version conflicts with your project's React installation.

## License

MIT

## Support

For issues, questions, or contributions:

- **GitHub Repository**: [https://github.com/abubakvr/faq-widget.git](https://github.com/abubakvr/faq-widget.git)
- **NPM Package**: [faq-chatbot](https://www.npmjs.com/package/faq-chatbot)

For API-related issues, refer to your backend API documentation.
