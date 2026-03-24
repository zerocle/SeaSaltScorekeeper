import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ConfirmDeleteGameDialog from "../ConfirmDeleteGameDialog";

describe("ConfirmDeleteGameDialog", () => {
    it("renders nothing when not visible", () => {
        const { queryByText } = render(
            <ConfirmDeleteGameDialog
                visible={false}
                onCancel={jest.fn()}
                onConfirm={jest.fn()}
            />,
        );
        expect(queryByText("Delete Game")).toBeNull();
    });

    it("renders title and message when visible", () => {
        const { getByText } = render(
            <ConfirmDeleteGameDialog
                visible={true}
                onCancel={jest.fn()}
                onConfirm={jest.fn()}
            />,
        );
        expect(getByText("Delete Game")).toBeTruthy();
        expect(getByText(/cannot be undone/)).toBeTruthy();
    });

    it("calls onConfirm when Delete button is pressed", () => {
        const onConfirm = jest.fn();
        const { getByLabelText } = render(
            <ConfirmDeleteGameDialog
                visible={true}
                onCancel={jest.fn()}
                onConfirm={onConfirm}
            />,
        );
        fireEvent.press(getByLabelText("Delete Game"));
        expect(onConfirm).toHaveBeenCalled();
    });

    it("calls onCancel when Cancel button is pressed", () => {
        const onCancel = jest.fn();
        const { getByLabelText } = render(
            <ConfirmDeleteGameDialog
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
            <ConfirmDeleteGameDialog
                visible={true}
                onCancel={onCancel}
                onConfirm={jest.fn()}
            />,
        );
        fireEvent.press(getByLabelText("Close dialog"));
        expect(onCancel).toHaveBeenCalled();
    });
});
