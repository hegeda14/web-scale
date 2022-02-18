import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icon/iron-icon.js';

class WebScale extends PolymerElement {
  static get properties() {
    return {
      weight: {
        type: Number,
        value: 0
      },
      unit: {
        type: String,
        value: 'g'
      },
      label: {
        type: String,
        value: 'N/A'
      },
      config: {
        type: Object,
        value: {
          vendorId: 0x0922,
          productId: 0x8003,
          dataModeGrams: 0x02,
          dataModeOunces: 0x0b,
          connectButtonText: 'connect',
          disconnectButtonText: 'disconnect'
        }
      },
      connected: {
        type: Boolean,
        value: false
      },
      frontend: {
        type: Boolean,
        value: false
      }
    };
  }

  static get template() {
    return html`
      <style include="iron-flex">
        #container {
          @apply --shadow-elevation-2dp;
          width: 25em;
        }
        #container[hidden] {
          display: none !important;
        }
        #container > * {
          margin-left: 0.5em;
          margin-right: 0.5em;
        }
      </style>

      <div id="container" class="layout horizontal center" hidden$="[[!frontend]]">
        <iron-icon icon="[[ _resolveIcon(connected) ]]"></iron-icon>
        <paper-input label="[[label]]" value="[[weight]]" class="flex">
          <div slot="suffix">[[unit]]</div>
        </paper-input>
        <paper-button raised on-tap="_buttonTap">[[ _resolveButtonText(connected) ]]</paper-button>
      </div>
    `;
  }

  _buttonTap() {
    !this.connected ? this.connect() : this.disconnect();
  }

  _resolveButtonText(connected) {
    return (!connected) ? this.config.connectButtonText : this.config.disconnectButtonText;
  }

  _resolveIcon(connected) {
    return (!connected) ? 'cancel' : 'check-circle';
  }

  async connect() {
    let scale = await navigator.hid.requestDevice({
      filters: [{
        vendorId: this.config.vendorId,
        productId: this.config.productId
      }]
    });

    if (scale && scale.length == 1) this.setup(scale[0]);

  }

  async reconnect() {
    let scale = (await navigator.hid.getDevices()).filter(device =>
      device.vendorId == this.config.vendorId &&
      device.productId == this.config.productId
    );

    if (scale && scale.length == 1) this.setup(scale[0]);
  }

  async disconnect() {
    let scale = (await navigator.hid.getDevices()).filter(device =>
      device.vendorId == this.config.vendorId &&
      device.productId == this.config.productId
    );

    if (scale && scale.length == 1) scale[0].close();
    this.set('connected', false);
    this.set('label', 'N/A');
  }

  setup(scale) {
    try {
      scale.addEventListener("inputreport", event => {
        /*
          How it works: (http://www.antradar.com/blog-dymo-usb-scale-interface-specs)
          - Data length: 5 bytes
            * (1.) 0-7: Misc. flags / Unused
            * (2.) 8-15: Unit (0x02 Gram /2/, 0x0b Ounce /11/)
            * (3.) 16-23: Scaling factor, negative power of 10
            * (4.) 24-31: Lower scale reading
            * (5.) 32-39: Higher scale reading
          - Result: ((4.) + (5.) * 256) / (10 shifted to proper decimal place with (3.) * -1)
        */
        const { data, device, reportId } = event;

        // Unit
        let dataMode = data.getInt8(1);
        this.set('unit', dataMode == this.config.dataModeOunces ? 'oz' : 'g');
        // The weight calculation
        let rawWeight = (data.getUint8(3) + data.getUint8(4) * 256) / (10 ** (data.getInt8(2) * -1));
        this.set('weight', rawWeight);
      });

      scale.open();

      this.set('connected', true);
      this.set('label', scale.productName);
    } catch (exception) {
      console.error(exception);
    }
  }

  constructor() {
    super();

    if (!navigator.hid) {
      console.error('not_supported');
      this.remove();
      return;
    }

    navigator.hid.addEventListener('connect', (event) => {
      // Does not trigger, unfortunately
      console.log(event)
    });

    navigator.hid.addEventListener('disconnect', (event) => {
      this.set('connected', false);
      this.set('label', 'N/A');
    });

    this.reconnect();
  }
}

customElements.define('web-scale', WebScale);