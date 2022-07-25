# [1.1.0](https://github.com/kkoomen/pointless/compare/v1.1.0-beta.16...v1.1.0) (2022-07-25)

### Bug Fixes

- adjust eraser bg color to match body bg color (fixes [#8](https://github.com/kkoomen/pointless/issues/8)) ([d321023](https://github.com/kkoomen/pointless/commit/d3210230fdc7e094426e140e09ee3d7080e06bb8))
- revert [#5](https://github.com/kkoomen/pointless/issues/5) and use memoization (fixes [#6](https://github.com/kkoomen/pointless/issues/6)) ([80e5748](https://github.com/kkoomen/pointless/commit/80e5748f845011e0d4d258397cb327212f4ceae5))

### Features

- add cross-platform support ([36db9bb](https://github.com/kkoomen/pointless/commit/36db9bb342d561f7ebca6262c1f507bb1c25b544))
- **PaperListItem:** adjust delete button styling ([ccc2efb](https://github.com/kkoomen/pointless/commit/ccc2efb7a8e7d0502eff55a14b43b24b4b793a3a))

# [1.1.0-beta.16](https://github.com/kkoomen/pointless/compare/v1.1.0-beta.15...v1.1.0-beta.16) (2022-05-12)

# [1.1.0-beta.15](https://github.com/kkoomen/pointless/compare/v1.1.0-beta.14...v1.1.0-beta.15) (2022-05-12)

# [1.1.0-beta.14](https://github.com/kkoomen/pointless/compare/v1.1.0-beta.13...v1.1.0-beta.14) (2022-05-12)

# [1.1.0-beta.13](https://github.com/kkoomen/pointless/compare/v1.1.0-beta.12...v1.1.0-beta.13) (2022-05-12)

# [1.1.0-beta.12](https://github.com/kkoomen/pointless/compare/v1.1.0-beta.11...v1.1.0-beta.12) (2022-05-12)

# [1.1.0-beta.11](https://github.com/kkoomen/pointless/compare/v1.1.0-beta.10...v1.1.0-beta.11) (2022-05-11)

# [1.1.0-beta.10](https://github.com/kkoomen/pointless/compare/v1.1.0-beta.9...v1.1.0-beta.10) (2022-05-11)

# [1.1.0-beta.9](https://github.com/kkoomen/pointless/compare/v1.1.0-beta.8...v1.1.0-beta.9) (2022-05-11)

### Bug Fixes

- adjust version replacement for release-it ([821d27e](https://github.com/kkoomen/pointless/commit/821d27ea5d549ceb933cb01f0efa5a4f6e155467))

# [1.1.0-beta.8](https://github.com/kkoomen/pointless/compare/v1.1.0-beta.7...v1.1.0-beta.8) (2022-05-11)

# [1.1.0-beta.7](https://github.com/kkoomen/pointless/compare/v1.1.0-beta.6...v1.1.0-beta.7) (2022-05-11)

# [1.1.0-beta.6](https://github.com/kkoomen/pointless/compare/v1.1.0-beta.5...v1.1.0-beta.6) (2022-05-11)

# [1.1.0-beta.5](https://github.com/kkoomen/pointless/compare/v1.1.0-beta.4...v1.1.0-beta.5) (2022-05-11)

# [1.1.0-beta.4](https://github.com/kkoomen/pointless/compare/v1.1.0-beta.3...v1.1.0-beta.4) (2022-05-11)

# [1.1.0-beta.3](https://github.com/kkoomen/pointless/compare/v1.1.0-beta.2...v1.1.0-beta.3) (2022-05-11)

# [1.1.0-beta.2](https://github.com/kkoomen/pointless/compare/v1.1.0-beta.1...v1.1.0-beta.2) (2022-05-11)

# [1.1.0-beta.1](https://github.com/kkoomen/pointless/compare/v1.1.0-beta.0...v1.1.0-beta.1) (2022-05-11)

# 1.1.0-beta.0 (2022-05-11)

### Bug Fixes

- add another fix to prevent an infinite loop ([02ad443](https://github.com/kkoomen/pointless/commit/02ad4436ba967909eb4be0c571dc6bd6d21fcba2))
- force another update in order to draw canvas preview properly ([fe88934](https://github.com/kkoomen/pointless/commit/fe88934ba1cf5f729ca1412dd27d70a81cf76785))
- **Paper:** prevent infinite loop ([6d94b35](https://github.com/kkoomen/pointless/commit/6d94b3544a301365d26f7bdd46bae3c41968c708))
- remove unused tauri::AppHandle import ([00e1d4f](https://github.com/kkoomen/pointless/commit/00e1d4fc2b4c3c29c1f11a879fafeaf5415b92bb))
- remove unused tauri::Manager import ([4671fb4](https://github.com/kkoomen/pointless/commit/4671fb425c4515db67020c13cb9f96a476bb66cc))
- **tauri.conf.json:** change com.tauri.dev -> com.pointless.app ([78a3d93](https://github.com/kkoomen/pointless/commit/78a3d93734e08141d91d693b6d7c059c75551fd3))

### Features

- add banner and adjust readme ([d9fcd3f](https://github.com/kkoomen/pointless/commit/d9fcd3fbbbd2a482460873f5bf662a11b6fdcac4))
- add icons ([d9cf539](https://github.com/kkoomen/pointless/commit/d9cf539a853cd54e2215664c95e3c1586aa0fe24))
- adjust primary color ([c14479c](https://github.com/kkoomen/pointless/commit/c14479caf701d390b8f2498f3a7ad78a0f88e972))
- generate all icons ([1fed1b4](https://github.com/kkoomen/pointless/commit/1fed1b4978b2ea903f8661ce17972e521b4b00dc))
- implement brotli compression for library ([216ab5e](https://github.com/kkoomen/pointless/commit/216ab5e32fcba6f064408a8410ef270443f27278))
- optimise InlineEdit and FolderListItem styling ([5f207eb](https://github.com/kkoomen/pointless/commit/5f207ebd0647d4d8e037f4a58fd323305c086d76))
- put commands into separate file; detect dark/light mode via rust ([63924a5](https://github.com/kkoomen/pointless/commit/63924a5f1f96cc3f04f186a96911e9840f5ccaa6))
- put handlers in src/commands.rs ([48e7778](https://github.com/kkoomen/pointless/commit/48e7778ebf729db5cac1357bd132f5d570461812))
- replace with a single button ([b2da685](https://github.com/kkoomen/pointless/commit/b2da6854c83c36ef426c206250c7818c5cd0c50c))
- rewrite dialogs to work with tauri api ([184a6dd](https://github.com/kkoomen/pointless/commit/184a6dd193193b5d19e871652af2729b9e80009c))
- rewrite electron -> tauri :fire: ([b18ec73](https://github.com/kkoomen/pointless/commit/b18ec732ab50d1ed2b0c398aad9673bc6c1f5d6b))
- show library & paper previews ([53cd306](https://github.com/kkoomen/pointless/commit/53cd30600a748017b05f905662c94e1db17c15b9))
- support ctrlkey for non-darwin platforms ([ec52bf0](https://github.com/kkoomen/pointless/commit/ec52bf06ad8e4ef9fa534db35513f0a50df3129e))
- use yarn instead of npm; add prettierrc ([b0e0c50](https://github.com/kkoomen/pointless/commit/b0e0c505c80d06e08e436c61c5e016fab34a067d))
