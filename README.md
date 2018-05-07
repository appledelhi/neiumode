# Neiu Mode README

Neiu Mode is a modal editing mode for Colemak keyboard. There are two modes,
one for executing commands and one for entering texts(like `vi`). You toggle between them with `home` key.

## Features

* Designed for Colemak keyboard.
* Ergonomic key layout.
* Developed on split keyboard(eg. [Kinesys Advantage](https://www.kinesis-ergo.com/shop/advantage2/)) but can be used for normal keyboard.
* Spacemacs like key bindings.

Command mode layout
![Command mode layout](images/keyboard.png)

## Key bindings

| key | description  |
|---|---|
| a  | Comment current line.  |
| b  | Select current line.  |
| c  | Copy selection. If no selection, copy current line.  |
| d  | Start selection mode.  |
| e  | Move cursor down.  |
| f  | Delete word left.  |
| g  | Delete line right.  |
| h  | Move cursor to the beginning of line.  |
| i  | Move cursor right.  |
| j  | Move cursor page up.  |
| J  | Move cursor to the beginning of file.  |
| k  | Move cursor page down.  |
| K  | Move cursor to the end of file.  |
| l  | Move cursor word left.  |
| m  |   |
| n  | Move cursor left.  |
| o  | Move cursor to the end of line.  |
| p  |   |
| q  |   |
| r  |   |
| s  | Delete character right.  |
| t  | Delete word right.  |
| u  | Move cursor up.  |
| v  | Paste.  |
| w  |   |
| x  | Cut.  |
| y  | Move cursor word right.  |
| z  | Undo.  |
| /  | Find.  |
| *  | Find current word.  |
| home  | Toggle insert/command mode.  |
| space b n  | Previous editor.  |
| space b i  | Next editor.  |
| space b u  | Navigate back.  |
| space b e  | Navigate forward.  |

## Extension Settings

You can change the key for toggling modes:

`{ "key": "home",                  "command": "extension.toggleNeiu",
                                     "when": "editorTextFocus" }`

## Release Notes

### 0.1.0

Initial release.

### 0.2.0

Added commands `space b n`, `space b i` for previous editor, next editor.

### 0.3.0

Added command `space b u`, `space b e` for navigate back, navigate forward.
Added command `d` for starting selection.

## Acknowledgment

This package has been influenced by the following key bindings.

* [Xah Fly Keys](http://ergoemacs.org/misc/ergoemacs_vi_mode.html)
* [Lalopmak Evil](https://github.com/lalopmak/lalopmak-evil)
* [Spacemacs](http://spacemacs.org)