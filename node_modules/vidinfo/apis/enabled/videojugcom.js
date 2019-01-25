/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 For more information on oEmbed visit http://oembed.com/
*/
module.exports = {
       url: 'http://www.videojug.com/oembed.json?url={:id}',
       regex: /(?:https?:\/\/)(?:.*\.)?videojug\.com\/(film|interview)\/(?:.+)/i,
       fullurl: true,
       shortcuts: ['vjug','videojug'],
};
