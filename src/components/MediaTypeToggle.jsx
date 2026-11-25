import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { MEDIA_TYPES } from "../utils/discoverSections.js";

function MediaTypeToggle({ value, onChange }) {
  return (
    <ToggleButtonGroup
      className="toggle-group"
      value={value}
      exclusive
      onChange={(_, next) => next && onChange(next)}
      aria-label="Media type"
    >
      {MEDIA_TYPES.map((type) => (
        <ToggleButton key={type.value} value={type.value} aria-label={type.label}>
          {type.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

export default MediaTypeToggle;
