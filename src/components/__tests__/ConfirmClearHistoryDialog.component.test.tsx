import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ConfirmClearHistoryDialog from "../ConfirmClearHistoryDialog";

describe("ConfirmClearHistoryDialog", () => {
    it("renders nothing when not visible", () => {
        const { queryByText } = render(
            <ConfirmClearHistoryDialog
                visible={false}
                onCancel={jest.fn()}
                onConfirm={jest.fn()}
            />,
        );
        expect(queryByText("Clear History")).toBeNull();
    });

    it("renders title and message when visible", () => {
        const { getByText } = render(
            <ConfirmClearHistoryDialog
                visible={true}
                onCancel={jest.fn()}
                onConfirm={jest.fn()}
            />,
        );
        expect(getByText("Clear History")).toBeTruthy();
        expect(getByText(/cannot be undone/)).toBeTruthy();
    });

    it("calls onConfirm when Clear All button is pressed", () => {
        const onConfirm = jest.fn();
        const { getByLabelText } = render(
            <ConfirmClearHistoryDialog
                visible={true}
                onCancel={jest.fn()}
                onConfirm={onConfirm}
            />,
        );
        fireEvent.press(getByLabelText("Clear All"));
        expect(onConfirm).toHaveBeenCalled();
    });

    it("calls onCancel when Cancel button is pressed", () => {
        const onCancel = jest.fn();
        const { getByLabelText } = render(
            <ConfirmClearHistoryDialog
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
            <ConfirmClearHistoryDialog
                visible={true}
                onCancel={onCancel}
                onConfirm={jest.fn()}
            />,
        );
        fireEvent.press(getByLabelText("Close dialog"));
        expect(onCancel).toHaveBeenCalled();
    });
});
