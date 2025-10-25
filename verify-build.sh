#!/bin/bash

echo "🔍 Build Verification Script"
echo "================================"
echo ""

# Step 1: Check for api directories
echo "Step 1: Checking for api/ directories..."
API_DIRS=$(find . -type d -name "api" 2>/dev/null | grep -v node_modules)
if [ -z "$API_DIRS" ]; then
  echo "✅ No api/ directories found"
else
  echo "⚠️  Found api/ directories:"
  echo "$API_DIRS"
  echo "   These will be excluded from build"
fi
echo ""

# Step 2: Check for SDK imports
echo "Step 2: Checking for SDK imports in source files..."
SDK_IMPORTS=$(grep -r "@google/generative-ai" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | grep -v ".md" | grep -v "verify-build.sh")
if [ -z "$SDK_IMPORTS" ]; then
  echo "✅ No SDK imports found in source files"
else
  echo "❌ Found SDK imports:"
  echo "$SDK_IMPORTS"
  exit 1
fi
echo ""

# Step 3: Clear all caches
echo "Step 3: Clearing build caches..."
rm -rf dist/ .vite/ node_modules/.vite/ 2>/dev/null
rm -rf ./Bible/dist ./Bible/.vite 2>/dev/null
rm -rf ./language/dist ./language/.vite 2>/dev/null
rm -rf ./theological-journey/dist ./theological-journey/.vite 2>/dev/null
find . -name "*.tsbuildinfo" -type f -delete 2>/dev/null
echo "✅ All caches cleared"
echo ""

# Step 4: Verify tsconfig excludes api directories
echo "Step 4: Checking tsconfig.json..."
if grep -q '"exclude"' tsconfig.json && grep -q '"**/api"' tsconfig.json; then
  echo "✅ tsconfig.json excludes api directories"
else
  echo "⚠️  tsconfig.json may need updating"
fi
echo ""

# Step 5: Check current directory structure
echo "Step 5: Current directory structure..."
echo "Services directory:"
ls -la services/ 2>/dev/null | grep "\.ts$" | awk '{print "  ✅ " $9}'
echo ""

echo "================================"
echo "✅ Verification complete!"
echo ""
echo "Next steps:"
echo "1. Run: npm run build"
echo "2. If build succeeds, you're ready to deploy"
echo "3. If build fails, check the error message"
