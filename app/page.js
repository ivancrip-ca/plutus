import PageLogin from "./login/page";
import PublicRoute from "../components/PublicRoute";

export default function Home() {
  // Removed direct initialization of Firebase services
  return (
    <PublicRoute>
      <div className="">
        <PageLogin />
      </div>
    </PublicRoute>
  );
}
