import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Login",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="home"
        options={{
          title: "Minhas Fichas",
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="ficha"
        options={{
          title: "Ficha",
          headerShown: true,
        }}
      />
    </Stack>
  );
}