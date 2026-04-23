import { Image } from "../../domain/entities/Image";

export interface IImageRepository {
  save(image: Image): Promise<void>;
}

export interface ProcessImageRequest {
  url: string;
  userId: string;
}

export class ProcessImageUseCase {
  constructor(private imageRepo: IImageRepository) {}

  async execute(request: ProcessImageRequest): Promise<Image> {
    // 1. Validate permissions
    // 2. Process image with AI (mocked)
    const image = Image.create({
      url: request.url,
      ownerId: request.userId,
      metadata: { processed: true, engine: 'saarthi-v1' }
    });

    // 3. Persist
    await this.imageRepo.save(image);

    return image;
  }
}
