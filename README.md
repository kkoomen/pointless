![logo](./screenshots/banner.jpg)
![app](./screenshots/app.png)

# Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Development](#development)
- [Creating a build](#creating-a-build)
- [License](#license)

# Introduction

Pointless is an endless drawing canvas that provides useful features when you're
in need for a simple whiteboard/note app.

It is build using Tauri (Rust) and React with a pure SVG canvas and local files
are saved with brotli compression to ensure small file sizes.

❗️ Currently, this app can only be build locally. Anytime soon there will be
public releases available with prebuild binaries for MacOS, Windows and Linux.

📚 ✍️ Feel like contributing? Submit an issue with your ideas (or bugs) and
we'll discuss it.

# Features

- [ ] Save as PNG
- [ ] Save as JPG
- [ ] Toolbar
  - [x] Undo
  - [x] Redo
  - [x] Pan
  - [x] Clear
  - [x] Zoom in
  - [x] Zoom out
  - [x] Scale to fit
  - [x] Create arrow shapes
  - [x] Create rectangle shapes
  - [x] Create ellipse shapes
  - [ ] Text
- [x] Create folders
- [x] Save/load state from file
- [x] Light/dark theme

# Installation

```
$ git clone https://github.com/kkoomen/pointless.git && cd pointless
$ yarn install
```

# Development

Starting the development server can be done with `yarn run tauri dev`

# Creating a build

Creating a build can simply be done with `yarn run tauri build`

# License

Pointless is licensed under the GPL-3.0 license.
