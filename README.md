# EvalA11y - Website Accessibility Evaluator

A comprehensive Tampermonkey userscript for evaluating web accessibility compliance with WCAG 2.1 AA and EAA standards. 100% client-side processing with no external dependencies.

## Features

### Core Accessibility Checks

| Category | Checks | WCAG Criteria |
|----------|--------|---------------|
| **Images** | Missing alt text, empty alt, redundant alt phrases | 1.1.1 |
| **Headings** | Skipped levels, missing h1, multiple h1s, empty headings | 1.3.1 |
| **Links** | Empty links, vague link text, non-functional links | 2.4.4 |
| **Forms** | Missing labels, placeholder-only labels, ungrouped inputs | 1.3.1 |
| **Contrast** | Color contrast ratio below WCAG thresholds | 1.4.3 |
| **ARIA** | Invalid roles, broken references, hidden focusable content | 4.1.2 |
| **Focus** | Missing or invisible focus indicators | 2.4.7 |
| **Keyboard** | Positive tabindex, click-only handlers, mouse-only events | 2.1.1, 2.4.3 |

### Visual Overlay System

- Colored borders highlight issues directly on the page
- Severity-based color coding:
  - 🔴 **Critical** (Red) - Must fix immediately
  - 🟠 **Major** (Orange) - Should fix soon
  - 🟡 **Minor** (Yellow) - Consider fixing
- Hover tooltips with issue details and WCAG references

### Side Panel Interface

- Collapsible panel with all detected issues
- Issues grouped by category
- Click any issue to scroll and highlight the element
- Summary statistics by severity

### Export Options

- **JSON** - Structured data for developers and automation
- **CSV** - Spreadsheet-compatible for tracking and reporting
- **PDF** - Formatted document for stakeholders (opens printable page)

## Installation

### Prerequisites

Install Tampermonkey for your browser:
- [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
- [Safari](https://apps.apple.com/app/tampermonkey/id1482490089)

### Install EvalA11y

1. Open Tampermonkey in your browser
2. Click "Create a new script"
3. Delete the template content
4. Copy and paste the contents of `evala11y.user.js`
5. Press `Ctrl+S` (or `Cmd+S`) to save
6. The script is now active on all websites

## Usage

1. **Navigate** to any webpage you want to evaluate
2. **Click** the "♿ EvalA11y" button (bottom-right corner)
3. **Review** the results panel showing all issues
4. **Click** any issue to navigate to and highlight the element
5. **Export** results as JSON, CSV, or PDF as needed

### Panel Controls

| Button | Action |
|--------|--------|
| Toggle Overlays | Show/hide visual highlights on page |
| Export JSON | Download structured report |
| Export CSV | Download spreadsheet format |
| Export PDF | Open printable report page |

## Accessibility Checks Detail

### Images (WCAG 1.1.1)
- **Missing alt attribute** - Critical: Images must have alt text
- **Empty alt attribute** - Major: Empty alt may indicate non-decorative image without description
- **Redundant alt text** - Minor: Avoid "image of" or "picture of" in alt text

### Headings (WCAG 1.3.1)
- **Skipped heading level** - Major: Heading hierarchy should be sequential
- **Missing h1** - Major: Pages should have a main heading
- **Multiple h1 elements** - Minor: Typically one h1 per page
- **Empty heading** - Major: Headings must have text content

### Links (WCAG 2.4.4)
- **Empty link** - Critical: Links must have accessible text
- **Vague link text** - Major: "Click here", "Read more" don't describe destination
- **Non-functional link** - Minor: Links should have valid href

### Forms (WCAG 1.3.1)
- **Missing form label** - Critical: Inputs need associated labels
- **Placeholder as label** - Major: Placeholders disappear and aren't sufficient
- **Missing fieldset** - Minor: Related inputs should be grouped

### Contrast (WCAG 1.4.3)
- **Insufficient contrast** - Critical: Text must have 4.5:1 ratio (3:1 for large text)

### ARIA (WCAG 4.1.2)
- **Invalid ARIA role** - Major: Role attribute must use valid values
- **Hidden but focusable** - Critical: aria-hidden elements shouldn't contain focusable content
- **Invalid aria-labelledby** - Major: Referenced IDs must exist

### Focus (WCAG 2.4.7)
- **Missing focus indicator** - Major: Focusable elements need visible focus state

### Keyboard (WCAG 2.1.1, 2.4.3)
- **Positive tabindex** - Minor: Positive values disrupt natural tab order
- **Click without keyboard** - Major: Clickable elements need keyboard access
- **Mouse-only interaction** - Minor: Mouse events should have keyboard equivalents

## Security

- ✅ **100% client-side** - All processing happens in your browser
- ✅ **No external requests** - No data sent to any server
- ✅ **No third-party scripts** - Pure JavaScript, no dependencies
- ✅ **Minimal permissions** - Only requires access to run on web pages

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Firefox | ✅ Full |
| Edge | ✅ Full |
| Safari | ✅ Full |

## Limitations

- Contrast checking works best with solid background colors
- Dynamic content loaded after initial evaluation won't be checked (re-run evaluation)
- Some CSS-based focus indicators may not be detected
- Does not check for cognitive accessibility issues
- PDF export requires browser print functionality

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## Acknowledgments

Based on WCAG 2.1 AA guidelines and European Accessibility Act (EAA) requirements.
