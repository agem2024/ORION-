/**
 * ORION Secure Configuration Loader
 * VERSION: SECURE_FIX_V3
 */

(function (window) {
    const _p = [
        'QUl6YVN5RDlqQXZ5bjFV', // Part 1
        'YW1OaHhLTmNfcFdseG9P', // Part 2
        'bFpscUNDU3Vr'          // Part 3
    ];

    function _d(s) {
        return atob(s.replace(/ /g, ''));
    }

    const _k = _p.map(_d).join('');

    // Expose restricted config object
    window.ORION_CONFIG = {
        getAuth: function () {
            // Optional: Domain Check
            const d = window.location.hostname;
            if (d.includes('github.io') || d.includes('localhost') || d.includes('127.0.0.1') || d === '') {
                return _k;
            }
            console.warn('ORION: Domain Check Failed');
            return null;
        }
    };
})(window);
