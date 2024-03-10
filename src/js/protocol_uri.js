import $ from 'jquery';

import GUI from './gui';
import serial from './serial';
import PortHandler from "./port_handler";

export const protocol = 'btfltcp';
export const protocolScheme = `${protocol}://`;

export async function registerProtocolURI() {
    if (GUI.isCordova()) {
        handleCordovaOpenEvents();
        return;
    }

    const command = `"${process.execPath}" $_URL_`;

    console.log(`Registering ${protocolScheme} to '${command}'`);
    try {
        const ProtocolRegistry = require('protocol-registry');
        await ProtocolRegistry.register({
            protocol,
            command,
            override: true,
            terminal: false,
            script: true,
        });
        console.log(`Successfully registered ${protocolScheme} to '${command}'`);
    } catch (err) {
        console.error(`Failed to register ${protocolScheme} to '${command}' with error: `, err);
    }

    handleNWJSArgv();

    handleNWJSOpenEvents();
}

function connectTcp(tcpUrl) {
    // Explicitly add the 'manual' select option if the port options haven't loaded yet
    // (e.g. during a cold start)
    if ($('#port [value="manual"]').length === 0){
        PortHandler.addManualPortSelectOption();
    }

    $('#port').val('manual').trigger('change');
    $('#port-override').val(tcpUrl).trigger('change');
    $("div.connect_controls a.connect").trigger('click');
}

function handleNWJSArgv() {
    const connectionString = nw?.App?.argv?.[0] || '';
    const tcpUrl = `tcp://${connectionString.replace(protocolScheme, '')}`;
    if (tcpUrl.match(serial.tcpUrlRegex)) {
        console.log(`Connecting to ${tcpUrl} (from invocation with "${connectionString}")`);
        connectTcp(tcpUrl);
    }
}

function handleNWJSOpenEvents() {
    nw?.App?.on('open', (eventConnectionString) => {
        console.log(`Received NW.js "open" event: ${eventConnectionString}`);

        if (!eventConnectionString) return;

        const connectionStringRegex = new RegExp(`^.*${protocolScheme}(.*)$`);
        const url = eventConnectionString.match(connectionStringRegex)?.[1];
        if (!url) return;

        const tcpUrl = `tcp://${url}`;
        if (tcpUrl.match(serial.tcpUrlRegex)) {
            console.log(`Connecting to ${tcpUrl} (from "open" event with ${eventConnectionString})`);
            connectTcp(tcpUrl);
        }
    });
}

function handleCordovaOpenEvents() {
    // based on https://www.npmjs.com/package/cordova-plugin-customurlscheme
    window.handleOpenURL = (url) => {
        console.log(`Android deep link open event URL: ${url}`);
        const tcpUrl = `tcp://${url.replace(protocolScheme, '')}`;
        if (tcpUrl.match(serial.tcpUrlRegex)) {
            console.log(`Connecting to ${tcpUrl} (from Android deep link open even with URL: "${url}")`);
            connectTcp(tcpUrl);
        }
    };

    console.log(`Listening to ${protocolScheme} Android deep links`);
}
