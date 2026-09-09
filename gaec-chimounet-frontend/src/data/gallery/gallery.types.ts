export type GalleryImage = {
    id: string;
    /** Chemin dans le bucket Storage, ex. « gallery/tomates-a1b2c3d4.webp ». */
    storagePath: string;
    url: string;
    alt: string;
    isPublished: boolean;
    position: number;
};
