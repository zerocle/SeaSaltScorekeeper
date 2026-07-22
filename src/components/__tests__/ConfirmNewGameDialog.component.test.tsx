import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ConfirmNewGameDialog from "../ConfirmNewGameDialog";

describe("ConfirmNewGameDialog", () => {
    it("renders nothing when not visible", () => {
        const { queryByText } = render(
            <ConfirmNewGameDialog
                visible={false}
                onCancel={jest.fn()}
                onConfirm={jest.fn()}
            />,
        );
        expect(queryByText("Game Not Finished")).toBeNull();
    });

    it("renders title and message when visible", () => {
        const { getByText } = render(
            <ConfirmNewGameDialog
                visible={true}
                onCancel={jest.fn()}
                onConfirm={jest.fn()}
            />,
        );
        expect(getByText("Game Not Finished")).toBeTruthy();
        expect(getByText(/discard your current game/)).toBeTruthy();
    });

    it("calls onConfirm when Start New Game button is pressed", () => {
        const onConfirm = jest.fn();
        const { getByLabelText } = render(
            <ConfirmNewGameDialog
                visible={true}
                onCancel={jest.fn()}
                onConfirm={onConfirm}
            />,
        );
        fireEvent.press(getByLabelText("Start New Game"));
        expect(onConfirm).toHaveBeenCalled();
    });

    it("calls onCancel when Cancel button is pressed", () => {
        const onCancel = jest.fn();
        const { getByLabelText } = render(
            <ConfirmNewGameDialog
                visible={true}
                onCancel={onCancel}
                onConfirm={jest.fn()}
            />,
        );
        fireEvent.press(getByLabelText("Cancel"));
        expect(onCancel).toHaveBeenCalled();
    });

    it("calls onCancel when backdrop is pressed", () => {
        const onCancel = jest.fn();
        const { getByLabelText } = render(
            <ConfirmNewGameDialog
                visible={true}
                onCancel={onCancel}
                onConfirm={jest.fn()}
            />,
        );
        fireEvent.press(getByLabelText("Close dialog"));
        expect(onCancel).toHaveBeenCalled();
    });
});
