#!/bin/bash

echo "🔍 Getting Android SHA-256 Fingerprint"
echo "========================================"
echo ""

# Check for release keystore
if [ -f "android/release-key.keystore" ]; then
    echo "📦 Found release keystore"
    echo "Enter keystore password when prompted:"
    keytool -list -v -keystore android/release-key.keystore -alias key0 | grep -A 1 "SHA256:"
    echo ""
    echo "✅ Copy the SHA256 fingerprint above"
    echo "📝 Update: public/.well-known/assetlinks.json"
    exit 0
fi

# Check for debug keystore
if [ -f "$HOME/.android/debug.keystore" ]; then
    echo "🔧 Found debug keystore (for testing only)"
    SHA256=$(keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep "SHA256:" | cut -d' ' -f3)
    echo "SHA256: $SHA256"
    echo ""
    echo "⚠️  This is your DEBUG fingerprint - use for testing only!"
    echo "📝 Update: public/.well-known/assetlinks.json"
    echo ""
    echo "For production, you'll need your release keystore fingerprint."
    exit 0
fi

# Try to get from Android Studio build
if [ -d "android/app/build/outputs/apk" ]; then
    echo "🔍 Checking built APK..."
    APK=$(find android/app/build/outputs/apk -name "*.apk" | head -1)
    if [ -n "$APK" ]; then
        echo "Found APK: $APK"
        echo "Getting signing certificate..."
        # This requires apksigner tool
        if command -v apksigner &> /dev/null; then
            apksigner verify --print-certs "$APK" | grep "SHA-256"
        else
            echo "⚠️  apksigner not found. Install Android SDK build-tools."
        fi
    fi
fi

echo ""
echo "❌ No keystore found yet."
echo ""
echo "To generate a debug keystore (for testing):"
echo "  npx cap sync android"
echo "  npx cap open android"
echo "  Build the app in Android Studio"
echo "  Then run this script again"
echo ""
echo "To create a release keystore:"
echo "  keytool -genkey -v -keystore android/release-key.keystore -alias key0 -keyalg RSA -keysize 2048 -validity 10000"
