---
paths:
  - "app/components/**/*.tsx"
---

# Component Rules

- One component per directory: `ComponentName/ComponentName.tsx`
- Use named function exports for page components, default exports for reusable components
- Icons live in `app/components/ui/icons/` as individual `.tsx` files
- UI primitives (Button, Input, Modal, Select, Alert, Badge) live in `app/components/ui/`
- Import order: React → Components → Lib/Utils → Types → Styles (with comment separators like `/* Components */`)
- All components use TypeScript with explicit return types (`: ReactElement`)
