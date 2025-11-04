/**
 * Custom Swagger Patches Example
 *
 * This example shows how to create custom patch functions
 * to fix non-standard Swagger formats.
 */

import type { PatchFunction } from "@miaoosi/swagger2ts";

// Fix custom timestamp format
const fixTimestamp: PatchFunction = (content: string) => {
  return content.replace(
    /"type":\s*"Timestamp"/gi,
    '"type": "string", "format": "date-time"'
  );
};

// Fix missing required fields
const addRequiredFields: PatchFunction = (content: string) => {
  const spec = JSON.parse(content);

  // Modify spec object
  if (spec.paths) {
    // Your custom logic here
    // Example: Add required fields to all operations
    Object.values(spec.paths).forEach((pathItem: any) => {
      Object.values(pathItem).forEach((operation: any) => {
        if (operation.parameters) {
          // Your logic to add required fields
        }
      });
    });
  }

  return JSON.stringify(spec, null, 2);
};

// Fix enum values
const fixEnumValues: PatchFunction = (content: string) => {
  return content.replace(
    /"enum":\s*\[(.*?)\]/g,
    (match, enumValues) => {
      // Ensure enum values are properly quoted
      const values = enumValues.split(',').map((v: string) => v.trim());
      return `"enum": [${values.join(', ')}]`;
    }
  );
};

export { fixTimestamp, addRequiredFields, fixEnumValues };
