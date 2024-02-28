import {
    AudioPlayer,
    AudioPlayerError,
    AudioPlayerStatus,
    AudioResource,
    createAudioPlayer,
} from '@discordjs/voice';

export class QueuePlayer<Metadata extends null | undefined> {
    readonly player = createAudioPlayer();

    private readonly queue: AudioResource<Metadata>[] = [];

    private isPlaying = false;

    private idleTask: (() => void) | null = null;

    private errorTask: ((error: AudioPlayerError) => void) | null = null;

    constructor(player: AudioPlayer) {
        player.on(AudioPlayerStatus.Idle, () => {
            if (this.idleTask != null) {
                this.idleTask();
                this.idleTask = null;
            }
        });
        player.on('error', (error) => {
            if (this.errorTask != null) {
                this.errorTask(error);
                this.errorTask = null;
            }
        });
        this.player = player;
    }

    async play(resource: AudioResource<Metadata>) {
        this.queue.push(resource);
        if (this.isPlaying) {
            return;
        }
        this.isPlaying = true;
        try {
            const queue = this.queue;
            let dequeuedResource = queue.shift();
            while (dequeuedResource != null) {
                const currentResource = dequeuedResource;
                await new Promise<void>((resolve, reject) => {
                    this.idleTask = () => resolve();
                    this.errorTask = (error) => reject(error);
                    this.player.play(currentResource);
                });
                dequeuedResource = queue.shift();
            }
        } finally {
            this.isPlaying = false;
        }
    }
}
