import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
          md="home"
        />
        <NativeTabs.Trigger.Label hidden>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="browse">
        <NativeTabs.Trigger.Icon
          sf={{ default: "book.closed", selected: "book.closed.fill" }}
          md="book"
        />
        <NativeTabs.Trigger.Label hidden>Browse</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="import">
        <NativeTabs.Trigger.Icon
          sf={{ default: "square.and.arrow.up", selected: "square.and.arrow.up.fill" }}
          md="square"
        />
        <NativeTabs.Trigger.Label hidden>Import</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
