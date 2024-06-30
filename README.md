# vipp

Vim-like browser based text editor. Currently in active development with limited functionality.

## Available terminal commands

| Command   | Description                                                 |
|----------:| ------------------------------------------------------------|
| **vipp**  | Launch the keyboard-based editor                            |
| **touch** | Create empty file                                           |
| **ls**    | Show files in directory                                     |
| **cd**    | Change directory                                            |
| **mkdir** | Make new directory                                          |
| **rm**    | Remove file or directory                                    |
| **pwd**   | Output current working directory                            |
| **cat**   | Output file text                                            |
| **echo**  | Output strings passed in as arguments                       |

## Available terminal operators

| Operator  | Description                                                 |
|----------:| ------------------------------------------------------------|
| **\|**    | Pipe output to next command                                 |
| **>**     | Redirect output to overwite file                            |
| **>>**    | Redirect output to append to file                           |

## Available terminal shortcuts

| Shortcut         | Description                                          |
|-----------------:| -----------------------------------------------------|
| **Ctrl** + **d** | Delete to previous whitespace                        |
| **Ctrl** + **k** | Clear terminal                                       |
| **Ctrl** + **u** | Clear current line (entire line, not from cursor)    |
| **Ctrl** + **v** | Paste clipboard text                                 |
| **Ctrl** + **←** | Shift cursor one word left                           |
| **Ctrl** + **→** | Shift cursor one word right                          |
| **↑**            | History search backward                              |
| **↓**            | History search forward                               |
| **←**            | Move cursor left                                     |
| **→**            | Move cursor right                                    |
