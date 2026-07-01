#!/bin/bash
# Post-installation script for GATE EC 2027 Dashboard .deb package
# Updates the desktop database and icon cache on Ubuntu

if command -v update-desktop-database &> /dev/null; then
  update-desktop-database -q /usr/share/applications 2>/dev/null || true
fi

if command -v gtk-update-icon-cache &> /dev/null; then
  gtk-update-icon-cache -f -t /usr/share/icons/hicolor 2>/dev/null || true
fi
