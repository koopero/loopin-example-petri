
# Window

``` control
path: loopin/window/fullscreen
hide: all
title: fullscreen
type: trigger
toggle: true
```

``` control
path: loopin/window/cursor
hide: all
title: cursor
type: trigger
toggle: true
```

``` control
path: loopin/osd/enabled
hide: all
title: OSD
type: trigger
toggle: true
```

## Snapshot

``` control
path: logic/snapshot
subs:
  snap:
    type: trigger
    title: Snap
    hide: all

  buffer:
    options:
      - canvas
      - particles
```

# Giffer

``` control
path: logic/giffer
subs:
  start:
    type: trigger
  delay:
    type: slider
    metric: true
    unit: s
    min: 0
    max: 10
  count:
    type: slider
    metric: true
    min: 30
    max: 600

  buffer:
    options:
      - canvas
      - particles
```

## OSD

The [OSD](https://loopin.tech/ofxLoopin-osd.html) is the ugly white-on-black glob of text in the top-left of every Loopin window, by default. Disable it here:

``` control
path: loopin/osd/enabled
type: trigger
toggle: true
```

You can also jam in custom text:

``` control
path: loopin/osd/text
type: text
size: 54
```
