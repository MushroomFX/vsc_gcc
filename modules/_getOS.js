function getOS() {
    const platform = process.platform;
    if (platform === 'win32') return 'windows';
    if (platform === 'linux') return 'linux';
    if (platform === 'darwin') return 'mac';
    return platform; // any other OS
}

module.exports = getOS