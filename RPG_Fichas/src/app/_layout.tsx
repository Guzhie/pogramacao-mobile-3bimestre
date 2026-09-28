import { Stack, router, useSegments } from "expo-router";
import { useEffect } from "react";

import { AuthProvider, useAuth } from "@/context/AuthContext";

function RouteGuard() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/");
    }

    if (isAuthenticated && inAuthGroup) {
      router.replace("/home");
    }
  }, [isAuthenticated, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RouteGuard />
    </AuthProvider>
  );
}