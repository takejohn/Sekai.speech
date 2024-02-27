import { ResponseError } from './ResponseError';
import { AudioQuery } from './types';
import { ValidationError } from './ValidationError';

async function castResponse<T>(res: Response): Promise<T> {
    if (res.ok) {
        return await res.json();
    }
    if (res.status == 422) {
        throw new ValidationError(await res.json());
    }
    throw new ResponseError(res.status, await res.json());
}

export class VoicevoxClient {
    public constructor(private baseUrl: string) {}

    public async getAudioQuery(
        text: string,
        speaker: number,
    ): Promise<AudioQuery> {
        const params = new URLSearchParams({
            text,
            speaker: speaker.toString(),
        });
        const res = await this.post('/audio_query', params);
        return await castResponse<AudioQuery>(res);
    }

    public async synthesize(query: AudioQuery, speaker: number) {
        const params = new URLSearchParams({
            speaker: speaker.toString(),
        });
        const res = await this.post('/synthesis', params, query, 'audio/wav');
        return await res.arrayBuffer();
    }

    private async post(
        endpoint: string,
        params: URLSearchParams,
        body?: unknown,
        acceptType?: string,
    ) {
        const headers: HeadersInit =
            acceptType != null
                ? {
                      'Content-Type': 'application/json',
                      Accept: acceptType,
                  }
                : {
                      'Content-Type': 'application/json',
                  };
        return await fetch(`${this.baseUrl}${endpoint}?${params}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
    }
}
