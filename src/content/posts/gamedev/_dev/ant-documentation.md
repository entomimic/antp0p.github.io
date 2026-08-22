---
title: The Ant Game Documentation WIP
author: antp0p
pubDatetime: 2026-08-21T14:37:43+00:00
slug: ant-doc
featured: false
draft: false
ogImage: "../default-og.jpg"
tags:
  - Ant Documentation
description: Some kind of doc for antp0p themselves...
---
## Input Pipeline

### ActionSet

The Container of `ActionAtom`s.

To execute multiple `ActionAtom`s at the same frame, use multiple `ActionSet`s, instead of config overlapping AA ranges.


| Property        | Type                | Default            | Description                                                                                                        |
| --------------- | ------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `main`          | `StringName`        | `Action.Main.NONE` | -                                                                                                                  |
| `event_name`    | `StringName`        | `&""`              | If triggered with`instantly_*()`, ignore this field.                                                              |
| `actions`       | `Array[ActionAtom]` | `[]`               | -                                                                                                                  |
| *!*`is_passive` | `bool`              | `false`            | If true, this AS won't be used to determine<br /> compatibility and interruptibility. Enabled by run-time AS only. |
| `buffer_frames` | `int`               | `8`                | -                                                                                                                  |

- *!: WIP...*

### ActionAtom


| Property           | Type         | Default | Description                                                                                             |
| ------------------ | ------------ | ------- | ------------------------------------------------------------------------------------------------------- |
| ^`main`            | `StringName` | `&""`   | The same as its AS                                                                                      |
| `branch`           | `StringName` | `&""`   | -                                                                                                       |
| `has_anim`         | `bool`       | `true`  | -                                                                                                       |
| `begin` and `end` | `int`        | `-1`    | Different from`Mod`, the begin can be `-1`. The `begin` field of `Mod` is required to at least be `1` |
| ...                |              |         |                                                                                                         |

- *^ Can't be assigned thru the inspector.*

## PlayerExclusive

### `can_stand_up()` and `should_stand_up()`

*Literally...*

### CQC series

2 `Area2D`s. `hint_box` is used to determine whether a CQC can be executed. The actual `box` is smaller than the hint box.

### Lazy Load

Freezes mobs outside the `Area2D`. OP?

## AttackMode

Uses with `AttackParam`. Currently it's a mess but semi-works (recoil bug).
