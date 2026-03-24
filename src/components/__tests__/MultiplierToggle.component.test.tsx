import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { MultiplierToggle } from "../MultiplierToggle";

describe("MultiplierToggle", () => {
    it("renders the label text", () => {
        const { getByText } = render(
            <MultiplierToggle
                active={false}
                onToggle={jest.fn()}
                label="×1"
                accessibilityLabel="Boat multiplier"
            />,
        );
        expect(getByText("×1")).toBeTruthy();
    });

    it("calls onToggle with true when pressed while inactive", () => {
        const onToggle = jest.fn();
        const { getByLabelText } = render(
            <MultiplierToggle
                active={false}
                onToggle={onToggle}
                label="×2"
                accessibilityLabel="Penguin multiplier"
            />,
        );
        fireEvent.press(getByLabelText("Penguin multiplier"));
        expect(onToggle).toHaveBeenCalledWith(true);
    });

    it("calls onToggle with false when pressed while active", () => {
        const onToggle = jest.fn();
        const { getByLabelText } = render(
            <MultiplierToggle
                active={true}
                onToggle={onToggle}
                label="×3"
                accessibilityLabel="Sailor multiplier"
            />,
        );
        fireEvent.press(getByLabelText("Sailor multiplier"));
        expect(onToggle).toHaveBeenCalledWith(false);
    });

    it("has correct accessibility state when active", () => {
        const { getByLabelText } = render(
            <MultiplierToggle
                active={true}
                onToggle={jest.fn()}
                label="×1"
                accessibilityLabel="Fish multiplier"
            />,
        );
        const toggle = getByLabelText("Fish multiplier");
        expect(toggle.props.accessibilityState).toMatchObject({
            checked: true,
        });
    });

    it("has correct accessibility state when inactive", () => {
        const { getByLabelText } = render(
            <MultiplierToggle
                active={false}
                onToggle={jest.fn()}
                label="×1"
                accessibilityLabel="Fish multiplier"
            />,
        );
        const toggle = getByLabelText("Fish multiplier");
        expect(toggle.props.accessibilityState).toMatchObject({
            checked: false,
        });
    });
});

describe("MultiplierToggle disabled state", () => {
    it("renders with disabled=true and active=false (visually disabled)", () => {
        const { getByLabelText } = render(
            <MultiplierToggle
                active={false}
                onToggle={jest.fn()}
                label="×2"
                accessibilityLabel="Disabled toggle"
                disabled={true}
            />,
        );
        const toggle = getByLabelText("Disabled toggle");
        expect(toggle.props.accessibilityState).toMatchObject({
            checked: false,
            disabled: true,
        });
    });

    it("does NOT call onToggle when disabled=true and active=false", () => {
        const onToggle = jest.fn();
        const { getByLabelText } = render(
            <MultiplierToggle
                active={false}
                onToggle={onToggle}
                label="×2"
                accessibilityLabel="Disabled toggle"
                disabled={true}
            />,
        );
        fireEvent.press(getByLabelText("Disabled toggle"));
        expect(onToggle).not.toHaveBeenCalled();
    });

    it("calls onToggle when disabled=true but active=true (can deactivate)", () => {
        const onToggle = jest.fn();
        const { getByLabelText } = render(
            <MultiplierToggle
                active={true}
                onToggle={onToggle}
                label="×2"
                accessibilityLabel="Active disabled toggle"
                disabled={true}
            />,
        );
        fireEvent.press(getByLabelText("Active disabled toggle"));
        expect(onToggle).toHaveBeenCalledWith(false);
    });
});
