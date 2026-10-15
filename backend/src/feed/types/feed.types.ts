export interface FeedCardPhoto {
  url: string;
  isMain: boolean;
}

export interface FeedCard {
  userId: string;
  name: string;
  age: number;
  city: string | null;
  photos: FeedCardPhoto[];
  commonInterests: string[];
}
