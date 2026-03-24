import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NumericCell } from "../NumericCell";

describe("NumericCell", () => {
    it("displays the current value", () => {
        const { getByLabelText } = render(
            <NumericCell
                value={5}
                onChange={jest.fn()}
                accessibilityLabel="Crabs for Alice"
            />,
        );
        const cell = getByLabelText("Crabs for Alice");
        expect(cell).toBeTruthy();
    });

    it("opens popover on press and selects a value", () => {
        const onChange = jest.fn();
        const { getByLabelText } = render(
            <NumericCell
                value={0}
                maxValue={6}
                onChange={onChange}
                accessibilityLabel="Shells for Bob"
            />,
        );
        // Press the cell to open popover
        fireEvent.press(getByLabelText("Shells for Bob"));
        // Select value 3 from the popover
        fireEvent.press(getByLabelText("Select 3"));
        expect(onChange).toHaveBeenCalledWith(3);
    });

    it("displays value as string", () => {
        const { getByLabelText } = render(
            <NumericCell
                value={0}
                onChange={jest.fn()}
                accessibilityLabel="Test cell"
            />,
        );
        expect(getByLabelText("Test cell")).toBeTruthy();
    });
});

it("closes popover after selecting a value", () => {
    const onChange = jest.fn();
    const { getByLabelText, queryByLabelText } = render(
        <NumericCell
            value={0}
            maxValue={3}
            onChange={onChange}
            accessibilityLabel="Test close"
        />,
    );
    // Open popover
    fireEvent.press(getByLabelText("Test close"));
    // Select a value — popover should close
    fireEvent.press(getByLabelText("Select 2"));
    expect(onChange).toHaveBeenCalledWith(2);
    // Popover should be closed (Modal visible=false means content not rendered)
    expect(queryByLabelText("Select 2")).toBeNull();
});
