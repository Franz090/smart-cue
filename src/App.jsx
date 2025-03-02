import { Suspense, lazy } from "react";

const InterviewAssistant = lazy(() => import("./components/InterviewAssistant"));

function App() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }
      >
        <InterviewAssistant />
      </Suspense>
    </div>
  );
}

export default App;
