{ pkgs ? import <nixpkgs> { } }: let
  tauri_libraries = with pkgs; [
    webkitgtk
    gtk3
    cairo
    gdk-pixbuf
    glib
    dbus
    openssl_3
  ];
in pkgs.mkShell {
  nativeBuildInputs = with pkgs; [
    # Node
    nodejs_20
    nodePackages.eslint_d

    # Rust
    cargo
    rustc
    rustfmt

    # Tauri
    pkg-config
    dbus
    openssl_3
    glib
    gtk3
    libsoup
    webkitgtk
    appimagekit
  ];

  shellHook = ''
    export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath tauri_libraries}:$LD_LIBRARY_PATH
    export XDG_DATA_DIRS=${pkgs.gsettings-desktop-schemas}/share/gsettings-schemas/${pkgs.gsettings-desktop-schemas.name}:${pkgs.gtk3}/share/gsettings-schemas/${pkgs.gtk3.name}:$XDG_DATA_DIRS
    export WEBKIT_DISABLE_COMPOSITING_MODE=1
  '';
}
