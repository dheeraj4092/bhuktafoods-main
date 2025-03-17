import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // You can add analytics or logging here
    console.log(`404 - Page not found: ${location.pathname}`);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 pt-24 sm:pt-28">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl mb-8">Page not found</p>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <a
            href="/"
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Go back home
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
