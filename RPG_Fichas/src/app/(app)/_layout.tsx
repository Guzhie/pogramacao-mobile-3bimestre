import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="home"
        options={{
          title: "Minhas Fichas",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="ficha"
        options={{
          title: "Ficha",
          headerShown: false,
        }}
      />
    </Stack>
  );
}