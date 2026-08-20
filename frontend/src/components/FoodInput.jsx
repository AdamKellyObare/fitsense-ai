import { useRef } from "react";
import { Camera as CameraIcon } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

function FoodInput({ food, setFood, onSubmit, loading, onPreview, previewLoading, onPhotoSelect }) {
  const fileInputRef = useRef(null);
  const busy = loading || previewLoading;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    // Reset immediately so picking the exact same file again still fires
    // onChange next time — the browser otherwise treats it as "unchanged".
    e.target.value = "";
    if (file) onPhotoSelect(file);
  };

  const handlePhotoButtonClick = async () => {
    if (!Capacitor.isNativePlatform()) {
      fileInputRef.current?.click();
      return;
    }

    // Native: reuses the exact Camera.getPhoto call already proven working
    // in Settings' permission test (CameraSource.Prompt itself offers
    // "Take Photo" vs "Choose from Gallery"). A rejection here is almost
    // always the user tapping Cancel, not a real error worth surfacing —
    // Settings' dedicated test button is the place to diagnose an actual
    // permission problem.
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
        quality: 80,
      });
      const blob = await (await fetch(photo.webPath)).blob();
      onPhotoSelect(new File([blob], "meal-photo.jpg", { type: blob.type || "image/jpeg" }));
    } catch {
      // Cancelled or denied — nothing to do.
    }
  };

  return (
    <>
      <div style={styles.inputRow}>
        <input
          type="text"
          placeholder="e.g. 3 eggs and toast"
          value={food}
          onChange={(e) => setFood(e.target.value)}
          style={styles.input}
        />

        <button
          type="button"
          onClick={handlePhotoButtonClick}
          disabled={busy}
          style={styles.photoButton}
          aria-label="Analyze a photo of your meal"
          title="Analyze a photo of your meal"
        >
          <CameraIcon size={18} strokeWidth={2.2} />
        </button>

        {/* capture="environment" is what makes mobile browsers offer "Take
            Photo" alongside "Choose from Library" in their native picker —
            desktop browsers simply ignore it and show a normal file dialog,
            so this one input covers both without any platform branching. */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={styles.hiddenFileInput}
        />
      </div>

      <div style={styles.buttonRow}>
        <button onClick={onSubmit} disabled={busy} style={styles.button}>
          {loading ? "Analyzing meal..." : "Analyze Meal"}
        </button>

        <button
          onClick={onPreview}
          disabled={busy}
          style={styles.previewButton}
          type="button"
        >
          {previewLoading ? "Previewing..." : "Just Preview"}
        </button>
      </div>
    </>
  );
}

const styles = {
  inputRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "15px",
  },

  input: {
    flex: 1,
    minWidth: 0,
    padding: "13px 14px",
    // Kept at >=16px deliberately: iOS auto-zooms the whole page on focus
    // for any text input below that size, and user-scalable=no in
    // index.html isn't reliably honored for that specific behavior on all
    // WebKit versions — the only fully robust fix is the font-size itself.
    fontSize: "16px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--line)",
    background: "var(--paper)",
    color: "var(--ink)",
    outline: "none",
    fontFamily: "var(--font-body)",
    boxSizing: "border-box",
  },

  photoButton: {
    flexShrink: 0,
    width: "48px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--line)",
    background: "var(--paper)",
    color: "var(--ink)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "border-color var(--duration-hover) ease",
  },

  hiddenFileInput: {
    display: "none",
  },

  buttonRow: {
    display: "flex",
    gap: "10px",
  },

  button: {
    flex: 1,
    padding: "13px",
    fontSize: "15px",
    cursor: "pointer",
    borderRadius: "var(--radius-full)",
    background: "var(--oxblood)",
    color: "#f5efe8",
    border: "none",
    fontWeight: "600",
    transition: "transform var(--duration-hover) var(--ease-out), background var(--duration-hover) ease",
  },

  // Ghost/outline treatment — visually subordinate to "Analyze Meal" since
  // it's the lower-commitment action (nothing gets saved).
  previewButton: {
    flex: 1,
    padding: "13px",
    fontSize: "15px",
    cursor: "pointer",
    borderRadius: "var(--radius-full)",
    background: "transparent",
    color: "var(--ink)",
    border: "1px solid var(--line)",
    fontWeight: "600",
    transition: "border-color var(--duration-hover) ease, transform var(--duration-hover) var(--ease-out)",
  },
};

export default FoodInput;
