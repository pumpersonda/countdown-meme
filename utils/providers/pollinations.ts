import type { ImageProvider } from '../imageProvider';

export class PollinationsProvider implements ImageProvider {
  private readonly baseUrl = 'https://image.pollinations.ai/prompt';
  private readonly width: number;
  private readonly height: number;

  constructor(width = 800, height = 600) {
    this.width = width;
    this.height = height;
  }

  async generateImage(prompt: string): Promise<string> {
    const seed = Math.floor(Math.random() * 1_000_000);
    const encoded = encodeURIComponent(prompt);
    return `${this.baseUrl}/${encoded}?width=${this.width}&height=${this.height}&seed=${seed}&nologo=true&model=turbo`;
  }
}
