import type { Property } from "src/types/kanban";

export function frontmatterTypeAssumption(
  key: string,
  val: Property["val"],
): {
  type: Property["type"];
  val: Property["val"];
} {
  // Check if the value is tags
  if (key === "tags") {
    if (typeof val === "string") {
      return {
        type: "tags",
        val: [val],
      };
    } else if (Array.isArray(val)) {
      return {
        type: "tags",
        val: val,
      };
    }
  }

  // Check if the string represents a boolean
  if (val === "true" || val === "false" || typeof val === "boolean") {
    return {
      type: "checkbox",
      val: val === "true" || val === true,
    };
  }

  // Check if the string is a date
  if (/^\d{4}-\d{2}-\d{2}$/.test(val as string)) {
    return {
      type: "date",
      val: val,
    };
  }

  // Check if the string is a datetime
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?Z?$/.test(val as string)) {
    return {
      type: "dateAndTime",
      val: val,
    };
  }

  // Since "tags" are already handled, in this time, an array must be a list
  if (Array.isArray(val)) {
    return {
      type: "list",
      val: val,
    };
  }

  // Check if the string represents a number
  if (!Number.isNaN(Number(val))) {
    return {
      type: "number",
      val: val,
    };
  }

  // Default to "text" if type cannot be determined
  return {
    type: "text",
    val: val,
  };
}
