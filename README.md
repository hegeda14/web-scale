# Web-Scale

A Polymer 3.0 WebElement for Dymo Postal Scales
Utilizes the WebHID API so only Chromium browser and derivatives are supported
[Supported browsers](https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API) 

## Good-to-know

  * Developed with and tested on a Dymo M5-EMEA Postal Scale
  * Tested under Linux only, udev rule included
  * Configurable scale settings, button texts, small frontend provided
  * Retrieve weight and unit measured

## Sources
  * [Weight Logic source](https://github.com/sparkfun/usb-scale)
  * [Scale HID source](http://www.antradar.com/blog-dymo-usb-scale-interface-specs)

## Usage
```html
<web-scale
    frontend
    weight="{{weight}}"
    unit="{{unit}}"
    connected="{{connected}}"> 
</web-scale>
```

  * `frontend` - If you need the builtin frontend
  * `weight` - Weight measured
  * `unit` - Unit of weight, gramms or ounces
  * `connected` - If you need to know, svale is connected or not
  * `config` - Config for the scale, preset, see the element