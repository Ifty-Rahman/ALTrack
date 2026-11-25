import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

function UserListSelect({
  value,
  options,
  onChange,
  className,
  labelId = "userlist-select-label",
  label = "List",
}) {
  return (
    <FormControl size="small" className={className} variant="outlined">
      <InputLabel className="InputLabel" id={labelId}>
        {label}
      </InputLabel>
      <Select
        labelId={labelId}
        label={label}
        value={value}
        onChange={onChange}
        MenuProps={{
          PaperProps: {
            className: "userlist-select-menu",
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default UserListSelect;
