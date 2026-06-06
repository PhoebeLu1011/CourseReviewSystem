import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { ScheduleProvider } from "./context/ScheduleContext";

export default function App() {
  return (
    <AuthProvider>
      <ScheduleProvider>
        <RouterProvider router={router} />
      </ScheduleProvider>
    </AuthProvider>
  );
}
