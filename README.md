# Faq Agent SDK (Chat Widget)

A React SDK widget component for integrating an AI chatbot into any React application.

## Installation

```bash
npm install faq-agent-sdk
```

or

```bash
yarn add faq-agent-sdk
```

or

```bash
pnpm add faq-agent-sdk
```

## Usage

### Basic Example

```tsx
import { Widget } from "faq-agent-sdk";
import "faq-agent-sdk/style.css";

function App() {
  return (
    <div className="p-4">
      <Widget baseUrl="http://localhost:8080" />
    </div>
  );
}
```

### With Custom Configuration

```tsx
import { Widget } from "faq-agent-sdk";
import "faq-agent-sdk/style.css";

function App() {
  return (
    <Widget
      baseUrl="https://api.example.com"
      welcomeMessage="Hi! Welcome to our support chat. How can I help you?"
      primaryColor="#3B82F6"
      secondaryColor="#2563EB"
      textSize="base"
      buttonText="Need Help?"
      className="my-custom-class"
      onInit={() => console.log("Widget initialized!")}
    />
  );
}
```

### Modal Widget (Floating Button)

The widget appears as a floating button in the bottom right corner and opens as a modal:

```tsx
import { Widget } from "faq-agent-sdk";
import "faq-agent-sdk/style.css";

function App() {
  return (
    <>
      {/* Your app content */}
      <div>Your website content...</div>

      {/* Widget - automatically shows as floating button */}
      <Widget
        baseUrl="https://your-api-domain.com"
        primaryColor="purple-600"
        secondaryColor="purple-700"
        welcomeMessage="Hello! How can I assist you today?"
      />
    </>
  );
}
```

## Props

| Prop                | Type                             | Required | Default                 | Description                                                         |
| ------------------- | -------------------------------- | -------- | ----------------------- | ------------------------------------------------------------------- |
| `baseUrl`           | `string`                         | Yes      | -                       | Base URL of the QA API                                              |
| `apiKey`            | `string`                         | No       | -                       | API key for authentication (reserved for future)                    |
| `className`         | `string`                         | No       | `""`                    | Additional CSS class name                                           |
| `onInit`            | `() => void`                     | No       | -                       | Callback function called when widget initializes                    |
| `sessionStorageKey` | `string`                         | No       | `"chat-widget-session"` | localStorage key for session persistence                            |
| `welcomeMessage`    | `string`                         | No       | `"Hello! How can I..."` | Default welcome message shown when chat opens                       |
| `primaryColor`      | `string`                         | No       | `"blue-600"`            | Primary color (Tailwind class like `"blue-600"` or hex `"#3B82F6"`) |
| `secondaryColor`    | `string`                         | No       | `"blue-700"`            | Secondary color for hover states (Tailwind class or hex)            |
| `textSize`          | `"sm" \| "base" \| "lg" \| "xl"` | No       | `"base"`                | Base text size for the widget                                       |
| `buttonText`        | `string`                         | No       | `"Chat with us"`        | Text displayed on the floating chat button                          |
| `typewriterSpeed`   | `number`                         | No       | `30`                    | Speed of typewriter effect (ms per character). Set to 0 to disable  |

## Features

- 💬 **Full Chat Interface** - Complete chat UI with message history
- ✨ **Typewriter Effect** - Assistant messages appear with a smooth typewriter animation
- 🎨 **Modal Design** - Opens as a modal from a floating button (bottom right)
- 🎨 **Customizable Colors** - Set primary and secondary colors (Tailwind classes or hex)
- 📝 **Welcome Message** - Customizable welcome message when chat opens
- 📏 **Text Sizing** - Adjustable text size (sm, base, lg, xl)
- 🔄 **Session Management** - Automatic session handling with localStorage persistence
- 📝 **Follow-up Questions** - Automatic follow-up question suggestions
- ⚡ **Loading States** - Visual feedback during API calls
- 🔒 **Error Handling** - Graceful error messages and recovery
- 📱 **Responsive** - Works on desktop and mobile devices
- 🎯 **TypeScript Support** - Full TypeScript definitions included

## Advanced Usage

### Using the API Client Directly

For advanced use cases, you can use the API client directly:

```tsx
import { ChatAPIClient } from "faq-agent-sdk";

const client = new ChatAPIClient("http://localhost:8080");

// Ask a question
const response = await client.askQuestion(
  "What can you help me with?",
  "session-id"
);

if (response.status) {
  console.log(response.data.answer);
  console.log(response.data.follow_up_question);
}
```

### Color Customization

You can use either Tailwind color classes or hex colors:

```tsx
// Using Tailwind color classes
<Widget
  baseUrl="http://localhost:8080"
  primaryColor="purple-600"
  secondaryColor="purple-700"
/>

// Using hex colors
<Widget
  baseUrl="http://localhost:8080"
  primaryColor="#8B5CF6"
  secondaryColor="#7C3AED"
/>
```

### Custom Message Handling

You can access types for building custom implementations:

```tsx
import type {
  ChatMessage,
  ApiResponse,
  AskQuestionResponse,
} from "faq-agent-sdk";

// Use types in your custom components
```

## API Requirements

The widget expects a QA API with the following endpoint:

- `POST /ask` - Ask a question and get an AI response

See the API documentation for complete endpoint details.

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

The widget uses Tailwind CSS for styling. The styles are bundled in `style.css` and must be imported:

```tsx
import "faq-agent-sdk/style.css";
```

You can override styles using the `className` prop or by targeting CSS classes:

```css
.chat-widget {
  /* Your custom styles */
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Peer Dependencies

This library requires React 18+ or 19+ to be installed in your project. React is listed as a peer dependency to avoid version conflicts.

## License

MIT

## Support

For issues or questions about the widget, please contact the development team.

For API-related issues, refer to your API documentation.
