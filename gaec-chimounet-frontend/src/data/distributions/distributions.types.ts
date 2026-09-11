export type DistributionDate = {
    id: string;
    date: string;
    location: string;
    isPublished: boolean;
    repeatsWeekly: boolean;
    recurrenceMonths: 6 | 12 | null;
    excludedDates: string[];
    recurrenceParentId: string | null;
};

export type DistributionDateInput = {
    date: string;
    location: string;
    isPublished: boolean;
    repeatsWeekly: boolean;
    recurrenceMonths: 6 | 12 | null;
    excludedDates: string[];
};
