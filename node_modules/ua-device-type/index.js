/*
* ua-device-type
* special thanks to rguerreiro author of https://github.com/rguerreiro/express-device
* who tracked down the device matching code from https://github.com/bjankord/Categorizr
* i needed to use this without using express. its a small lib so i bundled it up for all to enjoy.
*/


var defaultOptions = {
  emptyUserAgentDeviceType: 'desktop',
  unknownUserAgentDeviceType: 'phone',
  botUserAgentDeviceType: 'bot'
};

var devices = {
  tv:"tv",
  tablet:"tablet",
  phone:"phone",
  desktop:"desktop",
  bot:"bot"
}


module.exports = function(ua,options){
  options = options||{};        

  if (!ua || ua === '') {
    // No user agent.
    return options.emptyUserAgentDeviceType||devices.desktop;
  }

  if (ua.match(/GoogleTV|SmartTV|Internet TV|NetCast|NETTV|AppleTV|boxee|Kylo|Roku|DLNADOC|CE\-HTML/i)) {
    // if user agent is a smart TV - http://goo.gl/FocDk
    return devices.tv;
  } else if (ua.match(/Xbox|PLAYSTATION 3|Wii/i)) {
    // if user agent is a TV Based Gaming Console
    return devices.tv;
  } else if (ua.match(/iP(a|ro)d/i) || (ua.match(/tablet/i) && !ua.match(/RX-34/i)) || ua.match(/FOLIO/i)) {
    // if user agent is a Tablet
    return devices.tablet;
  } else if (ua.match(/Linux/i) && ua.match(/Android/i) && !ua.match(/Fennec|mobi|HTC Magic|HTCX06HT|Nexus One|SC-02B|fone 945/i)) {
    // if user agent is an Android Tablet
    return devices.tablet;
  } else if (ua.match(/Kindle/i) || (ua.match(/Mac OS/i) && ua.match(/Silk/i))) {
    // if user agent is a Kindle or Kindle Fire
    return devices.tablet;
  } else if (ua.match(/GT-P10|SC-01C|SHW-M180S|SGH-T849|SCH-I800|SHW-M180L|SPH-P100|SGH-I987|zt180|HTC( Flyer|_Flyer)|Sprint ATP51|ViewPad7|pandigital(sprnova|nova)|Ideos S7|Dell Streak 7|Advent Vega|A101IT|A70BHT|MID7015|Next2|nook/i) || (ua.match(/MB511/i) && ua.match(/RUTEM/i))) {
    // if user agent is a pre Android 3.0 Tablet
    return devices.tablet;
  } else if (ua.match(/BOLT|Fennec|Iris|Maemo|Minimo|Mobi|mowser|NetFront|Novarra|Prism|RX-34|Skyfire|Tear|XV6875|XV6975|Google Wireless Transcoder/i)) {
    // if user agent is unique mobile User Agent
    return devices.phone;
  } else if (ua.match(/Opera/i) && ua.match(/Windows NT 5/i) && ua.match(/HTC|Xda|Mini|Vario|SAMSUNG\-GT\-i8000|SAMSUNG\-SGH\-i9/i)) {
    // if user agent is an odd Opera User Agent - http://goo.gl/nK90K
    return devices.phone;
  } else if ((ua.match(/Windows (NT|XP|ME|9)/) && !ua.match(/Phone/i)) && !ua.match(/Bot|Spider|ia_archiver|NewsGator/i) || ua.match(/Win( ?9|NT)/i)) {
    // if user agent is Windows Desktop
    return devices.desktop;
  } else if (ua.match(/Macintosh|PowerPC/i) && !ua.match(/Silk/i)) {
    // if agent is Mac Desktop
    return devices.desktop;
  } else if (ua.match(/Linux/i) && ua.match(/X11/i) && !ua.match(/Charlotte/i)) {
    // if user agent is a Linux Desktop
    return devices.desktop;
  } else if (ua.match(/CrOS/)) {
    // if user agent is a Chrome Book
    return devices.desktop;
  } else if (ua.match(/Solaris|SunOS|BSD/i)) {
    // if user agent is a Solaris, SunOS, BSD Desktop
    return devices.desktop;
  } else if (ua.match(/curl|Bot|B-O-T|Crawler|Spider|Spyder|Yahoo|ia_archiver|Covario-IDS|findlinks|DataparkSearch|larbin|Mediapartners-Google|NG-Search|Snappy|Teoma|Jeeves|Charlotte|NewsGator|TinEye|Cerberian|SearchSight|Zao|Scrubby|Qseero|PycURL|Pompos|oegp|SBIder|yoogliFetchAgent|yacy|webcollage|VYU2|voyager|updated|truwoGPS|StackRambler|Sqworm|silk|semanticdiscovery|ScoutJet|Nymesis|NetResearchServer|MVAClient|mogimogi|Mnogosearch|Arachmo|Accoona|holmes|htdig|ichiro|webis|LinkWalker|lwp-trivial/i) && !ua.match(/mobile|Playstation/i)) {
    // if user agent is a BOT/Crawler/Spider
    return options.botUserAgentDeviceType||devices.bot;
  } else {
    // Otherwise assume it is a mobile Device
    return options.unknownUserAgentDeviceType||devices.phone;
  }
}

module.exports.devices = devices;
module.exports.defaultOptions = defaultOptions;
