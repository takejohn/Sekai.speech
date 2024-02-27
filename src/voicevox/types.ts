export interface Mora {
    text: string;
    consonant?: string;
    consonant_length?: number;
    vowel: string;
    vowel_length: number;
    pitch: number;
}

export interface AccentPhrase {
    moras: Mora[];
    accent: number;
    pause_more?: Mora;
    is_interrogative?: boolean;
}

export interface AudioQuery {
    accent_phrases: AccentPhrase[];
    speedScale: number;
    pitchScale: number;
    intonationScale: number;
    volumeScale: number;
    prePhonemeLength: number;
    postPhonemeLength: number;
    outputSamplingRate: number;
    outputStereo: boolean;
    readonly kana?: string;
}
