import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from "./components/theme-provider";
import BottomNav from "./components/BottomNav";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import BusResultsPage from "./pages/BusResultsPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import ETicketPage from "./pages/ETicketPage";
import RoutesPage from "./pages/RoutesPage";
import AccountPage from "./pages/AccountPage";
import RouteDetailsPage from "./pages/RouteDetailsPage";
import HelpSupportPage from "./pages/HelpSupportPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import MyBookingsPage from "./pages/MyBookingsPage";
import HighwayRadarPage from "./pages/HighwayRadarPage";
import LiveRadarWrapper from "./pages/LiveRadarWrapper";
import TripTypeSelectionPage from "./pages/TripTypeSelectionPage";
import RouteSearchPage from "./pages/RouteSearchPage";
import OutstationSearchPage from "./pages/OutstationSearchPage";
import ConnectingRoutesPage from "./pages/ConnectingRoutesPage";
import BookTicketPage from "./pages/BookTicketPage";
import SeatSelectionPage from "./pages/SeatSelectionPage";
import UpiPaymentPage from "./pages/UpiPaymentPage";
import NetBankingWalletPage from "./pages/NetBankingWalletPage";
import CardPaymentPage from "./pages/CardPaymentPage";
import NearbyBusesPage from "./pages/NearbyBusesPage";
import SOSButton from "./components/SOSButton";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminRoutesPage from "./pages/admin/AdminRoutesPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminRouteDetailsPage from "./pages/admin/AdminRouteDetailsPage";
import AdminDriversPage from "./pages/admin/AdminDriversPage";
import AdminSecurityPage from "./pages/admin/AdminSecurityPage";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage";
import { LanguageProvider } from "./lib/language";
import SplashScreen from "./components/SplashScreen";
import { useState, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="routes" element={<AdminRoutesPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="route-details" element={<AdminRouteDetailsPage />} />
          <Route path="drivers" element={<AdminDriversPage />} />
          <Route path="security" element={<AdminSecurityPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/bus-results" element={<BusResultsPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/e-ticket" element={<ETicketPage />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/route-details" element={<RouteDetailsPage />} />
          <Route path="/help" element={<HelpSupportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/radar" element={<LiveRadarWrapper />} />
          <Route path="/trip-type" element={<TripTypeSelectionPage />} />
          <Route path="/route-search" element={<RouteSearchPage />} />
          <Route path="/connecting-routes" element={<ConnectingRoutesPage />} />
          <Route path="/outstation-search" element={<OutstationSearchPage />} />
          <Route path="/seat-selection" element={<SeatSelectionPage />} />
          <Route path="/book-ticket" element={<BookTicketPage />} />
          <Route path="/payment/upi" element={<UpiPaymentPage />} />
          <Route path="/payment/netbanking/wallet" element={<NetBankingWalletPage />} />
          <Route path="/payment/card" element={<CardPaymentPage />} />
          <Route path="/nearby-buses" element={<NearbyBusesPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};


const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // FAIL-SAFE: Ensure splash screen always dismisses
    const splashFallback = setTimeout(() => {
      setShowSplash(false);
    }, 6000);

    // Initialize services safely in background
    const initServices = async () => {
      try {
        // Lazy-load heavy services to avoid blocking render
        const { sqlService } = await import("./services/offline/SQLService");
        await sqlService.initialize();
        console.log("App: Offline DB Initialized");
        
        const { syncEngine } = await import("./services/offline/SyncEngine");
        syncEngine.start();
        console.log("App: SyncEngine Started");
      } catch (err) {
        console.error("App: Offline init error:", err);
      }

      try {
        const { notificationService } = await import("./services/notificationService");
        notificationService.listenForMessages();
        notificationService.requestPermissionAndToken().catch(err => console.error("FCM err:", err));
      } catch (err) {
        console.error("App: Notification init error:", err);
      }

      try {
        const { analyticsService } = await import("./services/AnalyticsService");
        analyticsService.trackAppOpen();
      } catch (err) {
        console.error("App: Analytics init error:", err);
      }
    };

    initServices();

    return () => clearTimeout(splashFallback);
  }, []);


  return (
    <ErrorBoundary>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AnimatePresence mode="wait">
              {showSplash ? (
                <SplashScreen key="splash" onFinish={() => setShowSplash(false)} />
              ) : (
                <motion.div 
                  key="main-app" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.6 }}
                  className="h-full w-full"
                >
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <AnimatedRoutes />
                    <SOSButton />
                    <BottomNav />
                  </BrowserRouter>
                </motion.div>
              )}
            </AnimatePresence>
          </TooltipProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
