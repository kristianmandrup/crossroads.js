var Xtender = require('../utils').Xtender;

module.exports = {
  SignalHelper:   require('./signal_helper'),
  SignalAware:    require('./signal_aware'),
  Signals: Xtender.extend(this.SignalHelper, this.SignalAware)
}
