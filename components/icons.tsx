import { SymbolView, type SFSymbol } from "expo-symbols";
import { useColorScheme } from "react-native";

type IconProps = {
    name: SFSymbol;
    size?: number;
    color?: string;
    weight?: "ultraLight" | "thin" | "light" | "regular" | "medium" | "semibold" | "bold" | "heavy" | "black";
};

export default function Icon({
    name,
    size = 20,
    color,
    weight = "regular",
}: IconProps) {
    const colorScheme = useColorScheme();
    return (
        <SymbolView
            name={name}
            tintColor={color ?? (colorScheme === 'dark' ? 'white' : 'black')}
            size={size}
            weight={weight}
            resizeMode="scaleAspectFit"
        />
    );
}
