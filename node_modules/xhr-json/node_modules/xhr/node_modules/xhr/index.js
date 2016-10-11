
/**
 * XMLHttpRequest / ActiveXObject
 *
 * example:
 *
 *        var req = xhr();
 *
 * @return {Object}
 */

module.exports = function () {
  if (window.XMLHttpRequest) return new XMLHttpRequest();
  try{ return new ActiveXObject('msxml2.xmlhttp.6.0'); } catch(e){}
  try{ return new ActiveXObject('msxml2.xmlhttp.3.0'); } catch(e){}
  try{ return new ActiveXObject('msxml2.xmlhttp'); } catch(e){}
};
