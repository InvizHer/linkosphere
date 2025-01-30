import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";

const Index = () => {
  const { user } = useAuth();

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Welcome to Link Manager</h1>
        <p className="mt-4">
          {user ? (
            <span>
              Hello, {user.email}! You can manage your links in the{" "}
              <Link to="/dashboard" className="text-blue-500">
                Dashboard
              </Link>
            </span>
          ) : (
            <span>
              Please{" "}
              <Link to="/login" className="text-blue-500">
                login
              </Link>{" "}
              to manage your links.
            </span>
          )}
        </p>
      </main>
    </div>
  );
};

export default Index;
