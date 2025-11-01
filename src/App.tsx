import { Widget } from "../dist/index";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Chat Widget Demo
          </h1>
          <p className="text-gray-600">
            Click the chat button in the bottom right to open the widget
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Customization Example</h2>
          <p className="text-gray-600 mb-4">
            This widget is configured with custom colors, text size, and welcome
            message. The chat button will appear in the bottom right corner.
          </p>
        </div>
      </div>

      {/* Widget with customizations */}
      <Widget
        baseUrl={import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}
        welcomeMessage="Welcome! I'm here to help answer your questions. What would you like to know?"
        primaryColor="#3B82F6"
        secondaryColor="#2563EB"
        textSize="base"
        buttonText="Chat with us"
        typewriterSpeed={5}
      />
    </div>
  );
}

export default App;
