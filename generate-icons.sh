#!/bin/bash
#
# Icon Generation Script for Navio Safari Extension
#
# This script generates all required icon sizes from the existing icons.
# Requires ImageMagick (brew install imagemagick on macOS)
#
# Usage: ./generate-icons.sh

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
IMAGES_DIR="$SCRIPT_DIR/Navio Extension/Resources/images"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed."
    echo "Install it with: brew install imagemagick"
    echo ""
    echo "Alternatively, create the missing icon sizes manually:"
    echo "  - icon-16.png (16x16)"
    echo "  - icon-19.png (19x19)"
    echo "  - icon-32.png (32x32)"
    echo "  - icon-38.png (38x38)"
    exit 1
fi

cd "$IMAGES_DIR"

echo "Generating missing icon sizes..."

# Use icon-48.png as source for smaller sizes
SOURCE_ICON="icon-48.png"

if [ ! -f "$SOURCE_ICON" ]; then
    echo "Error: Source icon $SOURCE_ICON not found!"
    exit 1
fi

# Generate 16x16
if [ ! -f "icon-16.png" ]; then
    echo "Creating icon-16.png..."
    convert "$SOURCE_ICON" -resize 16x16 icon-16.png
fi

# Generate 19x19
if [ ! -f "icon-19.png" ]; then
    echo "Creating icon-19.png..."
    convert "$SOURCE_ICON" -resize 19x19 icon-19.png
fi

# Generate 32x32
if [ ! -f "icon-32.png" ]; then
    echo "Creating icon-32.png..."
    convert "$SOURCE_ICON" -resize 32x32 icon-32.png
fi

# Generate 38x38
if [ ! -f "icon-38.png" ]; then
    echo "Creating icon-38.png..."
    convert "$SOURCE_ICON" -resize 38x38 icon-38.png
fi

echo ""
echo "Icon generation complete!"
echo ""
echo "Generated icons:"
ls -lh icon-16.png icon-19.png icon-32.png icon-38.png 2>/dev/null || echo "Some icons may already exist"

echo ""
echo "Note: These are auto-generated from icon-48.png."
echo "For production use, consider creating optimized versions at each size."
