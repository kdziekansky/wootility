# Publishing to Raycast Store - Complete Guide

This guide covers everything you need to publish the Wootility Manager extension to the official Raycast Store.

## Pre-Publishing Checklist

### 1. Extension Quality

- ✅ **All commands work correctly** with real hardware
- ✅ **Error handling is comprehensive** and user-friendly
- ✅ **Mock data works** when Wootility isn't available
- ✅ **Performance is acceptable** (commands respond within 3 seconds)
- ✅ **UI follows Raycast guidelines** and conventions
- ✅ **Code is clean and well-documented**

### 2. Required Assets

- ✅ **Extension Icon** (512x512px PNG, works in light and dark themes)
- ✅ **Screenshots** (2000x1250px PNG, up to 6 images)
- ✅ **README.md** with clear usage instructions
- ✅ **Proper package.json** with all required fields

### 3. Testing Completion

- ✅ **All test phases completed** (see TESTING.md)
- ✅ **Real hardware testing** with Wooting devices
- ✅ **Error scenarios tested** thoroughly
- ✅ **Performance testing** passed

## Step 1: Prepare Extension Assets

### 1.1 Create Extension Icon

**Requirements:**
- Size: 512x512 pixels
- Format: PNG
- Filename: `keyboard.png` (or update package.json)
- Works in both light and dark themes

**Design Guidelines:**
- Simple, recognizable keyboard icon
- Wooting brand colors if desired (with permission)
- Clear visibility at small sizes
- Follows Raycast icon conventions

**Icon Creation Tools:**
- Figma (free, web-based)
- Adobe Illustrator
- Sketch (macOS)
- Free alternatives: GIMP, Canva

### 1.2 Create Screenshots

**Requirements:**
- Size: 2000x1250 pixels
- Format: PNG
- Maximum: 6 screenshots
- Show most important features

**Screenshot Content Suggestions:**

1. **Profile Management** - Main command showing device list and profiles
2. **Profile Switching** - Action of switching between profiles
3. **RGB Control** - RGB effects selection and application
4. **Quick Switch** - HUD notification for quick switch command
5. **Device Information** - Device details view
6. **Settings/Preferences** - Extension configuration options

**Screenshot Guidelines:**
- Use consistent background across all screenshots
- Show realistic data (real device names, profiles)
- Demonstrate key features clearly
- No sensitive information visible
- Good contrast and readability

## Step 2: Finalize Code and Documentation

### 2.1 Code Review

```bash
# Run all quality checks
npm run lint
npm run build
npm run fix-lint
```

**Code Quality Checklist:**
- ✅ No TypeScript errors
- ✅ No ESLint warnings
- ✅ All imports resolve correctly
- ✅ Consistent code formatting
- ✅ Proper error handling everywhere
- ✅ No hardcoded paths or credentials

### 2.2 Update package.json

Ensure all fields are correctly filled:

```json
{
  "name": "wootility-manager",
  "title": "Wootility Manager",
  "description": "Control your Wooting keyboard profiles and RGB lighting from Raycast",
  "icon": "keyboard.png",
  "author": "your-actual-username",
  "categories": ["Productivity", "Developer Tools"],
  "license": "MIT"
}
```

**Important Fields:**
- **author**: Your actual GitHub username
- **description**: Clear, concise explanation
- **categories**: Appropriate Raycast categories
- **commands**: All command configurations correct

### 2.3 Create/Update README.md

**Essential Sections:**
1. **Clear description** of what the extension does
2. **Installation requirements** (Wootility, Wooting keyboard)
3. **Usage instructions** for each command
4. **Troubleshooting guide** for common issues
5. **Support information** and links

## Step 3: Fork Raycast Extensions Repository

### 3.1 Fork the Repository

1. **Go to:** https://github.com/raycast/extensions
2. **Click "Fork"** button (top-right)
3. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/extensions.git
   cd extensions
   ```

### 3.2 Create Feature Branch

```bash
# Create and switch to feature branch
git checkout -b add-wootility-manager

# Create extension directory
mkdir extensions/wootility-manager
cd extensions/wootility-manager
```

### 3.3 Copy Extension Files

Copy all your extension files to the new directory:

```bash
# Copy all files from your development directory
cp -r /path/to/your/wootility-manager/* .

# Verify structure
ls -la
```

**Required Structure:**
```
extensions/wootility-manager/
├── src/
│   ├── manage-profiles.tsx
│   ├── quick-switch.tsx
│   ├── rgb-control.tsx
│   ├── device-info.tsx
│   ├── hooks/
│   └── utils/
├── assets/
│   └── keyboard.png
├── metadata/
│   ├── screenshot-1.png
│   ├── screenshot-2.png
│   └── ...
├── package.json
└── README.md
```

## Step 4: Test in Extensions Repository

### 4.1 Install and Test

```bash
# Install dependencies
npm install

# Test development mode
npm run dev
```

### 4.2 Validate Extension

```bash
# Run Raycast validation
npm run build

# Check for any store-specific issues
npm run lint
```

**Common Issues to Fix:**
- Missing or incorrect icon
- Package.json validation errors
- TypeScript compilation errors
- Missing README sections

## Step 5: Submit Pull Request

### 5.1 Commit Changes

```bash
# Add all files
git add .

# Commit with descriptive message
git commit -m "Add Wootility Manager extension

- Manage Wooting keyboard profiles from Raycast
- Switch profiles instantly with quick commands
- Control RGB lighting effects
- View device information and status
- Works with all Wooting keyboard models
- Includes mock data for development/testing"
```

### 5.2 Push to Your Fork

```bash
# Push to your fork
git push origin add-wootility-manager
```

### 5.3 Create Pull Request

1. **Go to your fork** on GitHub
2. **Click "Compare & pull request"**
3. **Fill out PR template:**

```markdown
## Extension Description

Wootility Manager allows Raycast users to control their Wooting keyboards directly from Raycast, including profile switching and RGB lighting control.

## Features

- ✅ **Profile Management**: View and switch between keyboard profiles
- ✅ **Quick Switch**: Instant profile switching with keyboard shortcuts  
- ✅ **RGB Control**: Apply lighting effects to RGB-enabled keyboards
- ✅ **Device Information**: View connected device details and status
- ✅ **Error Handling**: Graceful fallbacks when hardware isn't available
- ✅ **Mock Data**: Works without Wootility for development/demonstration

## Testing

- ✅ Tested with real Wooting keyboards (One, Two, Two HE)
- ✅ All error scenarios handled gracefully
- ✅ Performance testing completed
- ✅ Mock data testing for users without hardware

## Hardware Requirements

- Wooting keyboard (any model)
- Wootility software installed
- Windows 10/11

## Screenshots

[Attach screenshots showing key features]

## Additional Notes

Extension includes comprehensive error handling and works with mock data when Wootility isn't available, making it accessible to users for testing even without Wooting hardware.
```

### 5.4 PR Review Process

**What to Expect:**
- **Automated checks** will run (linting, building)
- **Raycast team review** (usually within 1-2 weeks)
- **Possible feedback** requiring changes
- **Final approval** and merge

**Common Review Comments:**
- Icon improvements needed
- README clarifications
- Code quality suggestions
- Performance optimizations
- Better error messages

## Step 6: Post-Submission

### 6.1 Respond to Feedback

If reviewers request changes:

1. **Make requested changes** in your local branch
2. **Test thoroughly** after changes
3. **Commit and push** updates
4. **Respond to comments** explaining changes

### 6.2 Monitor Review Status

- **Check GitHub notifications** regularly
- **Respond promptly** to reviewer feedback
- **Be patient** - review process can take time
- **Ask questions** if feedback is unclear

## Step 7: Post-Publication

### 7.1 Extension Goes Live

Once merged:
- **Extension appears** in Raycast Store
- **Users can install** via Raycast
- **Analytics available** through Raycast dashboard

### 7.2 Maintenance

**Ongoing Responsibilities:**
- **Monitor user feedback** and issues
- **Update extension** for new Raycast API versions
- **Fix bugs** reported by users
- **Add features** based on user requests

### 7.3 Promotion

**Share Your Extension:**
- **Tweet about it** with @raycast mention
- **Share in Discord** communities
- **Write blog post** about development process
- **Add to your portfolio** as a project

## Common Rejection Reasons

### Technical Issues
- ❌ Extension doesn't build correctly
- ❌ TypeScript or linting errors
- ❌ Missing dependencies or broken imports
- ❌ Poor performance or crashes

### Assets Issues
- ❌ Missing or low-quality icon
- ❌ Insufficient or poor screenshots
- ❌ Inconsistent branding

### Documentation Issues
- ❌ Incomplete README
- ❌ Missing usage instructions
- ❌ No troubleshooting information

### Store Policy Issues
- ❌ Duplicate functionality of existing extensions
- ❌ Trademark or copyright violations
- ❌ Inappropriate content or categories

## Tips for Success

### 1. Quality First
- **Test extensively** before submission
- **Handle edge cases** gracefully
- **Follow Raycast conventions** consistently

### 2. Great Documentation
- **Write clear instructions** for setup and usage
- **Include troubleshooting** for common issues
- **Provide support** contact information

### 3. User Experience
- **Design intuitive workflows** for common tasks
- **Provide helpful error messages** with solutions
- **Make onboarding smooth** for new users

### 4. Community Engagement
- **Respond to feedback** constructively
- **Engage with users** who have questions
- **Contribute to discussions** in Raycast community

## Support Resources

- **Raycast Documentation:** https://developers.raycast.com
- **Extension Examples:** https://github.com/raycast/extensions
- **Community Discord:** https://discord.gg/raycast
- **Extension Guidelines:** https://developers.raycast.com/basics/prepare-an-extension-for-store

---

**Good luck with your submission!** 🚀

Remember: The Raycast team values quality and user experience, so take time to polish your extension before submission.