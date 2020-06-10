const { spawn } = require('child_process');
const dotenv = require('dotenv');

const ImapSyncParser = require('./parser');

dotenv.config();

const imapsync = user => {
    const cmd = 'imapsync';
    const args = ['--host1', process.env.FROM_HOST, '--user1', user, '--authuser1', process.env.FROM_ADMIN, '--password1', process.env.FROM_PASSWORD,
		  '--host2', 'imap.gmail.com', '--ssl2', '--user2', `${user}@${process.env.TO_DOMAIN}`, '--authuser2', process.env.TO_ADMIN,
		  '--password2', process.env.TO_PASSWORD, '--authmech2', 'XOAUTH2',
		  '--useheader', 'Message-ID', '--gmail2', '--no-modulesversion', '--nosslcheck', '--syncinternaldates', '--pidfile', '', '--nofoldersizes',
		  '--noreleasecheck', '--skipsize', '--fast'];
    return spawn(cmd, args);
};

module.exports = login => {
    const process = imapsync(login);
    return ImapSyncParser(process);
};
