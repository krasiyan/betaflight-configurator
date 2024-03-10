const ProtocolRegistry = require('protocol-registry'); // TODO: fix import

export async function registerProtocolURI() {
    const protocol = 'btfltcp';
    const protocolScheme = `${protocol}://`;
    const command = `"${process.execPath}" $_URL_`;

    console.log(`Registering ${protocolScheme} to '${command}'`);
    try {
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
}
