export interface Replacer {
    input: string;
    output: string;
}

const URL_PATTERN =
    /^https?:\/\/[\w!?\/+\-~=;.,*&@#$%()'[\]\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+/;

const EMOJI_PATTERN = /^:\w+:/;

export function getReplacer(input: string): Replacer | null {
    const urlMatcher = URL_PATTERN.exec(input);
    if (urlMatcher != null) {
        return {
            input: urlMatcher[0],
            output: 'ユーアルエル',
        };
    }
    const emojiMatcher = EMOJI_PATTERN.exec(input);
    if (emojiMatcher != null) {
        return {
            input: emojiMatcher[0],
            output: '',
        };
    }
    return null;
}
