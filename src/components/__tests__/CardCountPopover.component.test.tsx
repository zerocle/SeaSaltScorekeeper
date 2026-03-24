import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CardCountPopover } from "../CardCountPopover";

describe("CardCountPopover", () => {
    it("renders buttons from 0 to maxValue when visible", () => {
        const { getByText } = render(
            <CardCountPopover
                visible={true}
                currentValue={2}
                maxValue={5}
                onSelect={jest.fn()}
                onClose={jest.fn()}
                accessibilityLabel="Crabs count"
            />,
        );
        for (let i = 0; i <= 5; i++) {
            expect(getByText(String(i))).toBeTruthy();
        }
    });

    it("calls onSelect with the tapped value", () => {
        const onSelect = jest.fn();
        const { getByLabelText } = render(
            <CardCountPopover
                visible={true}
                currentValue={0}
                maxValue={3}
                onSelect={onSelect}
                onClose={jest.fn()}
                accessibilityLabel="Shells count"
            />,
        );
        fireEvent.press(getByLabelText("Select 2"));
        expect(onSelect).toHaveBeenCalledWith(2);
    });

    it("calls onClose when backdrop is pressed", () => {
        const onClose = jest.fn();
        const { getByLabelText } = render(
            <CardCountPopover
                visible={true}
                currentValue={0}
                maxValue={3}
                onSelect={jest.fn()}
                onClose={onClose}
                accessibilityLabel="Test"
            />,
        );
        fireEvent.press(getByLabelText("Close popover"));
        expect(onClose).toHaveBeenCalled();
    });

    it("displays the title from accessibilityLabel", () => {
        const { getByText } = render(
            <CardCountPopover
                visible={true}
                currentValue={0}
                maxValue={3}
                onSelect={jest.fn()}
                onClose={jest.fn()}
                accessibilityLabel="Octopus count"
            />,
        );
        expect(getByText("Octopus count")).toBeTruthy();
    });

    it("renders nothing meaningful when not visible", () => {
        const { queryByText } = render(
            <CardCountPopover
                visible={false}
                currentValue={0}
                maxValue={3}
                onSelect={jest.fn()}
                onClose={jest.fn()}
                accessibilityLabel="Hidden"
            />,
        );
        // Modal with visible=false should not render content
        expect(queryByText("Hidden")).toBeNull();
    });
});

describe("CardCountPopover disabledAbove", () => {
    it("buttons above disabledAbove get disabled styling but selected button keeps its style", () => {
        const { getByLabelText } = render(
            <CardCountPopover
                visible={true}
                currentValue={4}
                maxValue={5}
                disabledAbove={3}
                onSelect={jest.fn()}
                onClose={jest.fn()}
                accessibilityLabel="Shells count"
            />,
        );

        // Button at value 4 is the selected value AND above disabledAbove
        // It should keep selected styling (not get disabled styling)
        const selectedButton = getByLabelText("Select 4");
        const selectedStyles = selectedButton.props.style;
        const flatSelected = Array.isArray(selectedStyles)
            ? Object.assign({}, ...selectedStyles.filter(Boolean))
            : selectedStyles;
        // Selected button should NOT have opacity 0.4 (disabled styling)
        expect(flatSelected.opacity).not.toBe(0.4);

        // Button at value 5 is above disabledAbove and NOT selected
        // It should get disabled styling
        const disabledButton = getByLabelText("Select 5");
        const disabledStyles = disabledButton.props.style;
        const flatDisabled = Array.isArray(disabledStyles)
            ? Object.assign({}, ...disabledStyles.filter(Boolean))
            : disabledStyles;
        expect(flatDisabled.opacity).toBe(0.4);

        // Button at value 2 is below disabledAbove — should NOT be disabled
        const normalButton = getByLabelText("Select 2");
        const normalStyles = normalButton.props.style;
        const flatNormal = Array.isArray(normalStyles)
            ? Object.assign({}, ...normalStyles.filter(Boolean))
            : normalStyles;
        expect(flatNormal.opacity).not.toBe(0.4);
    });
});
