module.exports = totalSeconds => {
    totalSeconds = Math.floor(totalSeconds);
    var seconds = totalSeconds % 60;
    var minutes = Math.floor(totalSeconds / 60) % 60;
    var hours = Math.floor(totalSeconds / 60 / 60);
    return `${(hours > 0 ? `${hours}:` : '')}${ hours > 0 ? minutes.toString().padStart(2, '0') : minutes}:${seconds.toString().padStart(2, '0')}`
};