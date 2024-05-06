// XPQueue.js

class XPQueue {
    constructor(cooldownTime) {
        this.cooldownTime = cooldownTime; // Temps de recharge en millisecondes
        this.lastXPTime = {}; // Dernier temps où chaque utilisateur a obtenu de l'XP
    }

    canGetXP(userId) {
        const currentTime = Date.now();
        const lastTime = this.lastXPTime[userId] || 0;
        return currentTime - lastTime >= this.cooldownTime;
    }

    markXPObtained(userId) {
        this.lastXPTime[userId] = Date.now();
    }
}

module.exports = XPQueue;
