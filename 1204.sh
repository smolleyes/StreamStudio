#!/bin/bash
############
#
# use this script to use streamstudio on ubuntu < 13.04
MY_PATH="$PWD"

function GETOSTYPE()
{
	if [[ $(uname -m | grep 'x86_64') ]]; then
		nwLink="https://cdn.popcorntime.io/nw/v0.9.2/node-webkit-v0.9.2-linux-x64.tar.gz"
		name="node-webkit-v0.9.2-linux-x64.tar.gz" 
		echo "64 bits OS"
	else 
		nwLink="https://cdn.popcorntime.io/nw/v0.9.2/node-webkit-v0.9.2-linux-ia32.tar.gz"
		name="node-webkit-v0.9.2-linux-ia32.tar.gz" 
		echo "32 bits OS"
	fi
	downloadNW $nwLink $name
}

function downloadNW()
{
	TARGET="/tmp/$2"
	wget "$1" -O $TARGET
	echo -e "\nExtracting node-webkit 0.9.2 \n"
	tar xvzf $TARGET -C $MY_PATH --strip-components=1
	rm "$MY_PATH/streamstudio"
	mv "$MY_PATH/nw" "$MY_PATH/streamstudio"
	cd node_modules
	echo -e "\nEdit some files... \n"
	sed -i "s%{ type: 'udp4', reuseAddr: true }%'udp4'%" chromecast-js/node_modules/node-ssdp/lib/index.js
	sed -i "s%{ type: 'udp4', reuseAddr: true }%'udp4'%" chromecast-js/node_modules/mdns-js/lib/networking.js
	sed -i "s%{ type: 'udp4', reuseAddr: true }%'udp4'%" peerflix/node_modules/torrent-stream/node_modules/bittorrent-tracker/server.js
	sed -i "s%{ type: 'udp4', reuseAddr: true }%'udp4'%" peerflix/node_modules/torrent-stream/node_modules/bittorrent-tracker/client.js
	sed -i "s%{ type: 'udp4', reuseAddr: true }%'udp4'%" upnp-client/lib/client.js
	sed -i "s%{ type: 'udp4', reuseAddr: true }%'udp4'%" upnp-client/node_modules/node-ssdp/index.js
	sed -i "s%{ type: 'udp4', reuseAddr: true }%'udp4'%" upnpserver/node_modules/node-ssdp/lib/index.js
	cd ..
	sed -i 's%"chromium-args.*$%"chromium-args":"--ignore-gpu-blacklist",\n  "js-flags": "--harmony --harmony-generators"%' package.json

	echo -e "Done !!!"
	nohup ./streamstudio

	exit 0
}

#######################################################################################

if [[  $(find * -maxdepth 0 -type f | grep 'streamstudio$') ]]; then 
	GETOSTYPE
else
	echo "You MUST be in a streamstudio dir to execute this script (rename if it necessary)"
fi