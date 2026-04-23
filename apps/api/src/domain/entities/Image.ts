export interface ImageProps {
  id: string;
  url: string;
  ownerId: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export class Image {
  constructor(private props: ImageProps) {}

  public get id(): string {
    return this.props.id;
  }

  public get url(): string {
    return this.props.url;
  }

  public static create(props: Omit<ImageProps, 'id' | 'createdAt'>): Image {
    return new Image({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });
  }
}
