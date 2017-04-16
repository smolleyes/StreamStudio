/*
 VidInfo - Louis T. <LouisT@ltdev.im>
 https://github.com/LouisT/VidInfo

 Paid video distribution service.
*/
module.exports = {
       url: 'https://{:basicauth}@api.wistia.com/v1/medias/{:id}.json',
       regex: /(?:https?:\/\/)?(?:.*\.)?wistia\.com(?:\/stats)?\/medias\/(.+)/i,
       basicauth: true,
       shortcuts: 'wistia',
};
