import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from "react-native";

import { colors } from "../../constants/colors";

interface ButtonProps extends PressableProps {
  title: string;
}

export function Button({ title, ...props }: ButtonProps) {
  return (
    <Pressable
      {...props}
      style={styles.button}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  text: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "bold",
  },
});