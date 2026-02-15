
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SubscribeButton } from "../subscribe-button";
import { toggleSubscription } from "@/actions/subscriptions";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

// Mocks
jest.mock("@/actions/subscriptions", () => ({
  toggleSubscription: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}));

describe("SubscribeButton", () => {
  const mockToggleSubscription = toggleSubscription as jest.Mock;
  const mockToast = jest.fn();
  const mockRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (useRouter as jest.Mock).mockReturnValue({ refresh: mockRefresh });
  });

  it("renders 'Subscribe' when not subscribed", () => {
    render(<SubscribeButton targetUserId="user1" initialIsSubscribed={false} />);
    expect(screen.getByText("Subscribe")).toBeInTheDocument();
  });

  it("renders 'Subscribed' when subscribed", () => {
    render(<SubscribeButton targetUserId="user1" initialIsSubscribed={true} />);
    expect(screen.getByText("Subscribed")).toBeInTheDocument();
  });

  it("calls toggleSubscription and updates UI on click (Subscribe)", async () => {
    mockToggleSubscription.mockResolvedValue(true); // Return new status: true (Subscribed)

    render(<SubscribeButton targetUserId="user1" initialIsSubscribed={false} />);
    
    const button = screen.getByRole("button", { name: /subscribe/i });
    fireEvent.click(button);

    await waitFor(() => {
        expect(mockToggleSubscription).toHaveBeenCalledWith("user1");
    });
    
    // Check for toast
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Subscribed"
    }));

    // Check for router refresh
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("calls toggleSubscription and updates UI on click (Unsubscribe)", async () => {
    mockToggleSubscription.mockResolvedValue(false); // Return new status: false (Unsubscribed)

    render(<SubscribeButton targetUserId="user1" initialIsSubscribed={true} />);
    
    const button = screen.getByRole("button", { name: /subscribed/i });
    fireEvent.click(button);

    await waitFor(() => {
        expect(mockToggleSubscription).toHaveBeenCalledWith("user1");
    });

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Unsubscribed"
    }));
  });

  it("handles errors gracefully", async () => {
    mockToggleSubscription.mockRejectedValue(new Error("Failed"));

    render(<SubscribeButton targetUserId="user1" initialIsSubscribed={false} />);
    
    const button = screen.getByRole("button", { name: /subscribe/i });
    fireEvent.click(button);

    await waitFor(() => {
        expect(mockToggleSubscription).toHaveBeenCalled();
    });

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        variant: "destructive",
        title: "Error"
    }));
  });
});
