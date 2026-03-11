import type { ImageProvider } from '../imageProvider';

export class LoremFlickrProvider implements ImageProvider {
  private readonly width: number;
  private readonly height: number;

  constructor(width = 800, height = 600) {
    this.width = width;
    this.height = height;
  }

  async generateImage(prompt: string): Promise<string> {
    // LoremFlickr accepts comma-separated keywords
    const keywords = prompt.split(' ').join(',');
    return `https://loremflickr.com/${this.width}/${this.height}/${keywords}?random=${Date.now()}`;
  }
}
