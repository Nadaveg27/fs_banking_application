let io = null;

function setIo(ioInstance) {
    io = ioInstance;
}

function getIo() {
    return io;
}

module.exports = { setIo, getIo };
