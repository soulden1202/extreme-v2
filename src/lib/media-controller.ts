export class GlobalMediaController {
  private static activeElement: HTMLVideoElement | null = null;

  static register(element: HTMLVideoElement) {
    // 1. If there's an active element that isn't this one, kill it.
    if (this.activeElement && this.activeElement !== element) {
      console.log("[GlobalMediaController] Pausing previous active video");
      try {
        this.activeElement.pause();
        // Optional: Nuclear option if you want to force buffer drop
        // this.activeElement.removeAttribute("src");
        // this.activeElement.load();
      } catch (e) {
        console.error("[GlobalMediaController] Error pausing previous video", e);
      }
    }

    // 2. Set new active element
    this.activeElement = element;
    console.log("[GlobalMediaController] Registered new active video");
  }

  // REMOVED unregister method.
  // We want the controller to hold onto the reference even if it unmounts,
  // so that the NEXT video can find it and kill it if it's still playing.
  // static unregister(element: HTMLVideoElement) { ... }

  static pauseAll() {
    if (this.activeElement) {
        console.log("[GlobalMediaController] Pausing ALL for navigation");
        try {
            this.activeElement.pause();
            this.activeElement.removeAttribute("src"); // Nuclear cleanup on nav
            this.activeElement.load();
        } catch (e) {
            console.error("Error pausing all", e);
        }
        this.activeElement = null;
    }
  }
}
