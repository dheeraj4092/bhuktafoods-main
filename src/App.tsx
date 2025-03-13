import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Cart from "./pages/Cart";
import Checkout from "@/pages/Checkout";
import Subscription from "@/pages/Subscription";
import { ErrorBoundary } from "react-error-boundary";

const queryClient = new QueryClient();

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role="alert" className="p-4">
      <h2 className="text-2xl font-bold text-red-600">Something went wrong:</h2>
      <pre className="mt-2 text-sm text-red-500">{error.message}</pre>
    </div>
  );
}

const App = () => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <CartProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:productId" element={<ProductDetail />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/subscription" element={<Subscription />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CartProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </ErrorBoundary>
);

export default App;
