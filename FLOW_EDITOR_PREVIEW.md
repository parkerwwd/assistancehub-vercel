# Flow Editor Live Preview Feature

## Overview
The Flow Editor now includes a powerful live preview feature that allows you to see your flow changes in real-time without leaving the editor.

## Features

### 🖥️ **Multiple Device Previews**
- **Desktop** - Full-size preview for desktop users
- **Tablet** - 768px × 1024px viewport with device frame
- **Mobile** - 375px × 667px viewport with phone frame styling

### ⚡ **Real-Time Updates**
- Live preview indicator shows when preview is active
- Auto-save functionality keeps preview in sync (2-second delay)
- Instant refresh when switching between device types

### 🎛️ **Interactive Navigation**
- **Step Navigation** - Click dots to jump between flow steps
- **Form Testing** - Fill out forms and see validation in real-time
- **Responsive Testing** - Switch devices to test mobile experience

### 🚀 **Advanced Features**
- **Fullscreen Mode** - Expand preview for detailed testing with dedicated exit controls
- **Refresh Control** - Reset form data and restart flow
- **Progress Tracking** - Visual step indicators and completion status
- **Escape Key Support** - Press ESC to exit fullscreen mode
- **Body Scroll Lock** - Prevents background scrolling in fullscreen
- **Improved Navigation** - Clear distinction between fullscreen exit and preview close

## How to Use

### 1. Enable Preview
Click the **"Show Preview"** button in the flow editor header to open the preview panel.

### 2. Choose Device Type
Use the device icons in the preview header:
- 🖥️ Desktop
- 📱 Tablet  
- 📱 Mobile

### 3. Test Your Flow
- Navigate through steps using the dot indicators
- Fill out forms to test validation
- Use the refresh button to reset and start over

### 4. Responsive Design
Switch between device types to ensure your flow works well on all screen sizes.

## Layout Changes

When preview is enabled:
- **Main editor**: 5/12 columns (reduced from 8/12)
- **Preview panel**: 4/12 columns 
- **Sidebar**: 3/12 columns (reduced from 4/12)

When preview is disabled:
- **Main editor**: 8/12 columns
- **Sidebar**: 4/12 columns

## Auto-Save Behavior

The preview includes intelligent auto-save:
- Triggers 2 seconds after any change
- Only saves when preview is active
- Only for existing flows (not new drafts)
- Provides seamless real-time updates

## Tips for Best Results

### 📱 **Mobile Testing**
- Test form layouts in mobile view
- Verify button sizes are touch-friendly
- Check text readability at smaller sizes

### 🎨 **Design Verification**
- Use fullscreen mode for detailed design review
- Test color combinations across devices
- Verify hero images scale properly

### ⚡ **Performance**
- The preview updates automatically but doesn't affect actual flow visitors
- Changes are only saved after the auto-save delay
- Use external preview button for final testing

## Keyboard Shortcuts

- **Toggle Preview**: Click "Show/Hide Preview" button
- **Enter Fullscreen**: Click maximize icon (⛶) in preview header
- **Exit Fullscreen**: Click minimize icon (⧉) or press ESC key
- **Close Preview**: Click X icon (closes entire preview panel)
- **Refresh**: Click refresh icon to reset form state
- **Device Switch**: Click device icons in preview toolbar

## Fullscreen Mode Improvements

### 🔧 **Fixed Issues**
- **Button Confusion** - Separate buttons for fullscreen exit vs. preview close
- **Escape Key** - Press ESC to quickly exit fullscreen mode
- **Animation Conflicts** - Removed motion animations that caused positioning issues
- **Z-Index Problems** - Uses z-index 9999 to ensure fullscreen appears above all elements
- **Body Scroll** - Automatically prevents background page scrolling

### 🎯 **Clear Visual Indicators**
- **Maximize Icon** (⛶) - Enter fullscreen mode
- **Minimize Icon** (⧉) - Exit fullscreen mode  
- **Close Icon** (✕) - Close entire preview panel
- **Tooltips** - Hover for button explanations

### 📱 **Enhanced Experience**
- **Full Width Content** - Maximum space for testing
- **Better Scrollbars** - Improved styling in fullscreen mode
- **Header Border** - Clear separation between controls and content
- **Responsive Layout** - Works perfectly on all screen sizes

## Technical Details

### Components
- `FlowPreview.tsx` - Main preview component
- `PreviewStyles.css` - Device-specific styling
- Integrated with existing `StepRenderer` for consistency

### Responsive Breakpoints
- **Desktop**: 100% width
- **Tablet**: Max 768px width
- **Mobile**: Max 375px width

### Browser Support
- Modern browsers with CSS Grid support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers on iOS and Android

This preview feature dramatically improves the flow editing experience by providing instant visual feedback and eliminating the need to constantly switch between editor and preview windows.