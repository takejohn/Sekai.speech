export interface Replacer {
    input: string;
    output: string;
}

export function getReplacer(input: string, position: number): Replacer | null {
    const urlMatcher =
        /^https?:\/\/[\w!?\/+\-_~=;.,*&@#$%()'[\]\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+/.exec(
            input.substring(position),
        );
    if (urlMatcher != null) {
        return {
            input: urlMatcher[0],
            output: 'ユーアルエル',
        };
    }
    return null;
}
