export type MeetingPoint = {
    id: string;
    title: string;
    schedule: string;
    location: string;
    isPublished: boolean;
    position: number;
};

export type MeetingPointInput = {
    title: string;
    schedule: string;
    location: string;
    isPublished: boolean;
    position: number;
};
