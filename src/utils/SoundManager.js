import { Howl } from 'howler';

export class SoundManager {
    constructor() {
        this.sounds = {};
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        this.sounds = {
            doorOpen: new Howl({
                src: ['/assets/sounds/door_open.mp3'],
                volume: 0.5
            }),
            doorClose: new Howl({
                src: ['/assets/sounds/door_close.mp3'],
                volume: 0.5
            }),
            engineStart: new Howl({
                src: ['/assets/sounds/engine_start.mp3'],
                volume: 0.7
            }),
            buttonClick: new Howl({
                src: ['/assets/sounds/button_click.mp3'],
                volume: 0.3
            }),
            configuration: new Howl({
                src: ['/assets/sounds/configuration.mp3'],
                volume: 0.4
            })
        };

        this.initialized = true;
    }

    play(soundName) {
        if (!this.initialized) {
            this.init();
        }

        const sound = this.sounds[soundName];
        if (sound) {
            sound.play();
        }
    }

    stop(soundName) {
        if (!this.initialized) return;

        const sound = this.sounds[soundName];
        if (sound) {
            sound.stop();
        }
    }

    setVolume(soundName, volume) {
        if (!this.initialized) return;

        const sound = this.sounds[soundName];
        if (sound) {
            sound.volume(volume);
        }
    }
}