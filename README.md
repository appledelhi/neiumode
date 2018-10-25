# Neiu Mode README

Neiu Mode is a modal editing mode for Colemak keyboard. Modal editing means there are two modes,
one for executing commands and one for entering texts(like `vi`). You toggle between them with `home` key.

## Features

- Ergonomic key layout (for Colemak keyboard).
- Vi like repeat command. For example: place the cursor to a word(eg. `abc`), delete it with `t` and insert `xyz`. Press `.` will find next occurrenc of `abc`. Pressing `r` will repeat the replacement.
- Spacemacs like menu system. For example: `space /` to find in files.
- Developed on split keyboard(eg. [Kinesys Advantage](https://www.kinesis-ergo.com/shop/advantage2/)) but can be used for normal keyboard.
- Spacemacs like key bindings.

Command mode layout
![Command mode layout](images/keyboard.png)

## TODO

- Copy deleted text command to clipboard.

## Key bindings

| key             | description                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| a               | Comment current line.                                                                                |
| b               | Select current line.                                                                                 |
| c               | Copy selection. If no selection, copy current line. To copy continuous lines, press c several times. |
| d               | Start selection mode.                                                                                |
| e               | Move cursor down.                                                                                    |
| f               | Delete word left.                                                                                    |
| g               | Delete line right.                                                                                   |
| h               | Move cursor to the beginning of line.                                                                |
| i               | Move cursor right.                                                                                   |
| j               | Move cursor page up.                                                                                 |
| J               | Move cursor to the beginning of file.                                                                |
| k               | Move cursor page down.                                                                               |
| K               | Move cursor to the end of file.                                                                      |
| l               | Move cursor word left.                                                                               |
| m               |                                                                                                      |
| n               | Move cursor left.                                                                                    |
| o               | Move cursor to the end of line.                                                                      |
| p               |                                                                                                      |
| q               |                                                                                                      |
| r               | Repeat last deletion & insertion.                                                                    |
| s               | Delete character right.                                                                              |
| t               | Delete a character or word depending on the character under cursor.                                  |
| u               | Move cursor up.                                                                                      |
| v               | Paste.                                                                                               |
| w               |                                                                                                      |
| x               | Cut selection. If no selection, cut current line. To cut continuous lines, press x several times.    |
| y               | Move cursor word right.                                                                              |
| z               | Undo.                                                                                                |
| Z               | Redo.                                                                                                |
| /               | Find.                                                                                                |
| \*              | Find current word.                                                                                   |
| ~               | Toggle lower/upper case.                                                                             |
| ^               | Join lines.                                                                                          |
| home            | Toggle insert/command mode.                                                                          |
| space backspace | Navigate back.                                                                                       |
| space /         | Find in files.                                                                                       |
| space \*        | Find current word in files.                                                                          |
| space b n       | Previous editor.                                                                                     |
| space b i       | Next editor.                                                                                         |
| space b u       | Navigate back.                                                                                       |
| space b e       | Navigate forward.                                                                                    |
| space d         | Duplicate buffer.                                                                                    |

## Extension Settings

You can change the key for toggling modes:

`{ "key": "home", "command": "extension.toggleNeiu", "when": "editorTextFocus" }`

## Release Notes

### 0.1.0

Initial release.

### 0.2.0

Added commands `space b n`, `space b i` for previous editor, next editor.

### 0.3.0

Added command `space b u`, `space b e` for navigate back, navigate forward.
Added command `d` for starting selection.

### 0.3.1

Bug fixes.

### 0.4.0

Added repeat command `r`. Redo command `Z`.

### 0.5.0

Added `J` for cursorTop, `K` for cursorBottom.
`space backspace` for navigate back, `space /` for find in files, `space *` for find current
word in files.
`space d` for duplicate buffer. `~` for toggle case. `^` for join lines.

### 0.6.0

- Press `c`/`x` several times to copy/cut continuous lines.
- `t` command deletes text by context.

### 0.7.0

- `l`/`y` commands move cursor by subword.
- `.` command finds characters deleted last by `f`/`s` command.

## Acknowledgment

This package has been influenced by the following key bindings.

- [Xah Fly Keys](http://ergoemacs.org/misc/ergoemacs_vi_mode.html)
- [Lalopmak Evil](https://github.com/lalopmak/lalopmak-evil)
- [Spacemacs](http://spacemacs.org)
