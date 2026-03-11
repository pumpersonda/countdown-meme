import type { ImageProvider } from '../imageProvider';

const MODEL = 'black-forest-labs/FLUX.1-schnell';
const API_URL = `https://router.huggingface.co/hf-inference/models/${MODEL}`;

export class HuggingFaceProvider implements ImageProvider {
  private readonly token: string;

  constructor(token: string) {
    this.token = token;
  }

  async generateImage(prompt: string): Promise<string> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`HuggingFace error ${response.status}: ${err}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    uint8Array.forEach((byte) => { binary += String.fromCharCode(byte); });
    const base64 = btoa(binary);

    return `data:image/jpeg;base64,${base64}`;
  }
}
