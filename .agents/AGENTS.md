# Project Rules

## Third-Party Visualization Libraries
Before integrating any third-party visualization library:
1. Detect whether the package is already installed.
2. If it is not installed, add it to package.json and install it.
3. Verify the correct import paths from the installed version.
4. Do not assume import paths.
5. If the package exposes CSS from a different location, import the correct file.
6. If the library requires no CSS, remove the CSS import entirely.
