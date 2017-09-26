``` control
path: loopin/show/buffer
options:
  - particles
  - canvas
```

``` control
path: loopin/render/particles/float
subs:
  colourDistOffset:
    type: float
    min: -0.5
    max: 0.5
    digits: 4

  colourDistAmount:
    type: float
    min: 0
    max: 0.5
    digits: 4
    pow: 3

  damping:
    type: float
    min: 0
    max: 1
    digits: 4
    pow: 3

  churn:
    type: float
    min: 0
    max: 3
    digits: 4
    pow: 3


  gravity:
    type: float
    min: 0
    max: 1
    digits: 4
    pow: 3
```


``` control
path: loopin/render/canvas
subs:
  passes:
    type: float
    min: 1
    max: 512
    pow: 2
    digits: 1

  float/gain:
    type: float
    min: 0.5
    max: 16
    digits: 3
    pow: 2

  float/sizeMin:
    type: float
    min: 0.01
    max: 0.5
    digits: 3

  float/sizeMax:
    type: float
    min: 0.01
    max: 0.5
    digits: 3

  float/blurAmount:
    type: float
    min: 0
    max: 0.99
    digits: 3

  float/blurZoom:
    type: float
    min: 0
    max: 2
    pow: 2
    digits: 3

  float/blurZoomPow:
    type: float
    min: 0.001
    max: 4
    pow: 3
    digits: 4
```


``` control
path: loopin/camera/view/zoom
type: float
min: -4
max: -1
digits: 3
```
