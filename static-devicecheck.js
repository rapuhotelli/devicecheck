/*!
 * is.js 0.9.0
 * Original author: Aras Atasaygin
 * Simplified to be inlined and Environment only by: rapuhotelli
 * MIT
 */
window.is = (function() {

      // Baseline
      /* -------------------------------------------------------------------------- */

      // define 'is' object and current version
      var is = {};

      // define interfaces
      is.not = {};
      is.all = {};
      is.any = {};

      // cache some methods to call later on
      var toString = Object.prototype.toString;
      var slice = Array.prototype.slice;
      var hasOwnProperty = Object.prototype.hasOwnProperty;

      // helper function which reverses the sense of predicate result
      function not(func) {
          return function() {
              return !func.apply(null, slice.call(arguments));
          };
      }

      // helper function which call predicate function per parameter and return true if all pass
      function all(func) {
          return function() {
              var params = getParams(arguments);
              var length = params.length;
              for (var i = 0; i < length; i++) {
                  if (!func.call(null, params[i])) {
                      return false;
                  }
              }
              return true;
          };
      }

      // helper function which call predicate function per parameter and return true if any pass
      function any(func) {
          return function() {
              var params = getParams(arguments);
              var length = params.length;
              for (var i = 0; i < length; i++) {
                  if (func.call(null, params[i])) {
                      return true;
                  }
              }
              return false;
          };
      }

      // build a 'comparator' object for various comparison checks
      var comparator = {
          '<': function(a, b) { return a < b; },
          '<=': function(a, b) { return a <= b; },
          '>': function(a, b) { return a > b; },
          '>=': function(a, b) { return a >= b; }
      };

      // helper function which compares a version to a range
      function compareVersion(version, range) {
          var string = (range + '');
          var n = +(string.match(/\d+/) || NaN);
          var op = string.match(/^[<>]=?|/)[0];
          return comparator[op] ? comparator[op](version, n) : (version == n || n !== n);
      }

      // helper function which extracts params from arguments
      function getParams(args) {
          var params = slice.call(args);
          var length = params.length;
          if (length === 1 && is.array(params[0])) {    // support array
              params = params[0];
          }
          return params;
      }

      // is a given value function?
      is['function'] = function(value) {    // fallback check is for IE
        return toString.call(value) === '[object Function]' || typeof value === 'function';
      };


      // is a given value window?
      // setInterval method is only available for window object
      is.windowObject = function(value) {
          return value != null && typeof value === 'object' && 'setInterval' in value;
      };

      // Presence checks
      /* -------------------------------------------------------------------------- */

      //is a given value empty? Objects, arrays, strings
      is.empty = function(value) {
          if (is.object(value)) {
              var length = Object.getOwnPropertyNames(value).length;
              if (length === 0 || (length === 1 && is.array(value)) ||
                      (length === 2 && is.arguments(value))) {
                  return true;
              }
              return false;
          }
          return value === '';
      };



      // Environment checks
      /* -------------------------------------------------------------------------- */

      var freeGlobal = is.windowObject(typeof global == 'object' && global) && global;
      var freeSelf = is.windowObject(typeof self == 'object' && self) && self;
      var thisGlobal = is.windowObject(typeof this == 'object' && this) && this;
      var root = freeGlobal || freeSelf || thisGlobal || Function('return this')();

      var document = freeSelf && freeSelf.document;
      var previousIs = root.is;

      // store navigator properties to use later
      var navigator = freeSelf && freeSelf.navigator;
      var appVersion = (navigator && navigator.appVersion || '').toLowerCase();
      var userAgent = (navigator && navigator.userAgent || '').toLowerCase();
      var vendor = (navigator && navigator.vendor || '').toLowerCase();

      // is current device android?
      is.android = function() {
          return /android/.test(userAgent);
      };
      // android method does not support 'all' and 'any' interfaces
      is.android.api = ['not'];

      // is current device android phone?
      is.androidPhone = function() {
          return /android/.test(userAgent) && /mobile/.test(userAgent);
      };
      // androidPhone method does not support 'all' and 'any' interfaces
      is.androidPhone.api = ['not'];

      // is current device android tablet?
      is.androidTablet = function() {
          return /android/.test(userAgent) && !/mobile/.test(userAgent);
      };
      // androidTablet method does not support 'all' and 'any' interfaces
      is.androidTablet.api = ['not'];

      // is current device blackberry?
      is.blackberry = function() {
          return /blackberry/.test(userAgent) || /bb10/.test(userAgent);
      };
      // blackberry method does not support 'all' and 'any' interfaces
      is.blackberry.api = ['not'];

      // is current browser chrome?
      // parameter is optional
      is.chrome = function(range) {
          var match = /google inc/.test(vendor) ? userAgent.match(/(?:chrome|crios)\/(\d+)/) : null;
          return match !== null && is.not.opera() && compareVersion(match[1], range);
      };
      // chrome method does not support 'all' and 'any' interfaces
      is.chrome.api = ['not'];

      // is current device desktop?
      is.desktop = function() {
          return is.not.mobile() && is.not.tablet();
      };
      // desktop method does not support 'all' and 'any' interfaces
      is.desktop.api = ['not'];

      // is current browser edge?
      // parameter is optional
      is.edge = function(range) {
          var match = userAgent.match(/edge\/(\d+)/);
          return match !== null && compareVersion(match[1], range);
      };
      // edge method does not support 'all' and 'any' interfaces
      is.edge.api = ['not'];

      // is current browser firefox?
      // parameter is optional
      is.firefox = function(range) {
          var match = userAgent.match(/(?:firefox|fxios)\/(\d+)/);
          return match !== null && compareVersion(match[1], range);
      };
      // firefox method does not support 'all' and 'any' interfaces
      is.firefox.api = ['not'];

      // is current browser internet explorer?
      // parameter is optional
      is.ie = function(range) {
          var match = userAgent.match(/(?:msie |trident.+?; rv:)(\d+)/);
          return match !== null && compareVersion(match[1], range);
      };
      // ie method does not support 'all' and 'any' interfaces
      is.ie.api = ['not'];

      // is current device ios?
      is.ios = function() {
          return is.iphone() || is.ipad() || is.ipod();
      };
      // ios method does not support 'all' and 'any' interfaces
      is.ios.api = ['not'];

      // is current device ipad?
      // parameter is optional
      is.ipad = function(range) {
          var match = userAgent.match(/ipad.+?os (\d+)/);
          return match !== null && compareVersion(match[1], range);
      };
      // ipad method does not support 'all' and 'any' interfaces
      is.ipad.api = ['not'];

      // is current device iphone?
      // parameter is optional
      is.iphone = function(range) {
          // avoid false positive for Facebook in-app browser on ipad;
          // original iphone doesn't have the OS portion of the UA
          var match = is.ipad() ? null : userAgent.match(/iphone(?:.+?os (\d+))?/);
          return match !== null && compareVersion(match[1] || 1, range);
      };
      // iphone method does not support 'all' and 'any' interfaces
      is.iphone.api = ['not'];

      // is current device ipod?
      // parameter is optional
      is.ipod = function(range) {
          var match = userAgent.match(/ipod.+?os (\d+)/);
          return match !== null && compareVersion(match[1], range);
      };
      // ipod method does not support 'all' and 'any' interfaces
      is.ipod.api = ['not'];

      // is current operating system linux?
      is.linux = function() {
          return /linux/.test(appVersion);
      };
      // linux method does not support 'all' and 'any' interfaces
      is.linux.api = ['not'];

      // is current operating system mac?
      is.mac = function() {
          return /mac/.test(appVersion);
      };
      // mac method does not support 'all' and 'any' interfaces
      is.mac.api = ['not'];

      // is current device mobile?
      is.mobile = function() {
          return is.iphone() || is.ipod() || is.androidPhone() || is.blackberry() || is.windowsPhone();
      };
      // mobile method does not support 'all' and 'any' interfaces
      is.mobile.api = ['not'];

      // is current state offline?
      is.offline = not(is.online);
      // offline method does not support 'all' and 'any' interfaces
      is.offline.api = ['not'];

      // is current state online?
      is.online = function() {
          return !navigator || navigator.onLine === true;
      };
      // online method does not support 'all' and 'any' interfaces
      is.online.api = ['not'];

      // is current browser opera?
      // parameter is optional
      is.opera = function(range) {
          var match = userAgent.match(/(?:^opera.+?version|opr)\/(\d+)/);
          return match !== null && compareVersion(match[1], range);
      };
      // opera method does not support 'all' and 'any' interfaces
      is.opera.api = ['not'];

      // is current browser phantomjs?
      // parameter is optional
      is.phantom = function(range) {
          var match = userAgent.match(/phantomjs\/(\d+)/);
          return match !== null && compareVersion(match[1], range);
      };
      // phantom method does not support 'all' and 'any' interfaces
      is.phantom.api = ['not'];

      // is current browser safari?
      // parameter is optional
      is.safari = function(range) {
          var match = userAgent.match(/version\/(\d+).+?safari/);
          return match !== null && compareVersion(match[1], range);
      };
      // safari method does not support 'all' and 'any' interfaces
      is.safari.api = ['not'];

      // is current device tablet?
      is.tablet = function() {
          return is.ipad() || is.androidTablet() || is.windowsTablet();
      };
      // tablet method does not support 'all' and 'any' interfaces
      is.tablet.api = ['not'];

      // is current device supports touch?
      is.touchDevice = function() {
          return !!document && ('ontouchstart' in freeSelf ||
              ('DocumentTouch' in freeSelf && document instanceof DocumentTouch));
      };
      // touchDevice method does not support 'all' and 'any' interfaces
      is.touchDevice.api = ['not'];

      // is current operating system windows?
      is.windows = function() {
          return /win/.test(appVersion);
      };
      // windows method does not support 'all' and 'any' interfaces
      is.windows.api = ['not'];

      // is current device windows phone?
      is.windowsPhone = function() {
          return is.windows() && /phone/.test(userAgent);
      };
      // windowsPhone method does not support 'all' and 'any' interfaces
      is.windowsPhone.api = ['not'];

      // is current device windows tablet?
      is.windowsTablet = function() {
          return is.windows() && is.not.windowsPhone() && /touch/.test(userAgent);
      };
      // windowsTablet method does not support 'all' and 'any' interfaces
      is.windowsTablet.api = ['not'];


      // API
      // Set 'not', 'all' and 'any' interfaces to methods based on their api property
      /* -------------------------------------------------------------------------- */

      function setInterfaces() {
          var options = is;
          for (var option in options) {
              if (hasOwnProperty.call(options, option) && is['function'](options[option])) {
                  var interfaces = options[option].api || ['not', 'all', 'any'];
                  for (var i = 0; i < interfaces.length; i++) {
                      if (interfaces[i] === 'not') {
                          is.not[option] = not(is[option]);
                      }
                      if (interfaces[i] === 'all') {
                          is.all[option] = all(is[option]);
                      }
                      if (interfaces[i] === 'any') {
                          is.any[option] = any(is[option]);
                      }
                  }
              }
          }
      }
      setInterfaces();

      return is;
  })()

