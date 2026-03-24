import React from "react";
import { render } from "@testing-library/react-native";
import { CrabIcon } from "../CrabIcon";
import { BoatIcon } from "../BoatIcon";
import { FishIcon } from "../FishIcon";
import { ShellIcon } from "../ShellIcon";
import { OctopusIcon } from "../OctopusIcon";
import { PenguinIcon } from "../PenguinIcon";
import { SailorIcon } from "../SailorIcon";
import { MermaidIcon } from "../MermaidIcon";
import { SharkSwimmerIcon } from "../SharkSwimmerIcon";
import { DiceIcon } from "../DiceIcon";
import { DeckIcon } from "../DeckIcon";
import { StopHandIcon } from "../StopHandIcon";
import { TrophyIcon } from "../TrophyIcon";

const icons = [
    { name: "CrabIcon", Component: CrabIcon },
    { name: "BoatIcon", Component: BoatIcon },
    { name: "FishIcon", Component: FishIcon },
    { name: "ShellIcon", Component: ShellIcon },
    { name: "OctopusIcon", Component: OctopusIcon },
    { name: "PenguinIcon", Component: PenguinIcon },
    { name: "SailorIcon", Component: SailorIcon },
    { name: "MermaidIcon", Component: MermaidIcon },
    { name: "SharkSwimmerIcon", Component: SharkSwimmerIcon },
    { name: "DiceIcon", Component: DiceIcon },
    { name: "DeckIcon", Component: DeckIcon },
    { name: "StopHandIcon", Component: StopHandIcon },
    { name: "TrophyIcon", Component: TrophyIcon },
];

describe.each(icons)("$name", ({ Component }) => {
    it("renders with default props", () => {
        const { toJSON } = render(<Component />);
        expect(toJSON()).toBeTruthy();
    });

    it("renders with custom size and color", () => {
        const { toJSON } = render(<Component size={32} color="#ff0000" />);
        expect(toJSON()).toBeTruthy();
    });
});
