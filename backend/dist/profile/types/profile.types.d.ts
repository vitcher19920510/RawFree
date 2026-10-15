export interface ProfilePhoto {
    id: string;
    url: string;
    order: number;
    isMain: boolean;
}
export interface ProfileInterest {
    id: string;
    tag: string;
    type: string;
}
export interface ProfileResponse {
    userId: string;
    name: string;
    age: number;
    gender: string;
    lookingFor: string;
    city: string;
    geoLat: number | null;
    geoLon: number | null;
    height: number | null;
    bio: string;
    hiddenFromFeed: boolean;
    verificationStatus: string;
    photos: ProfilePhoto[];
    interests: ProfileInterest[];
}
