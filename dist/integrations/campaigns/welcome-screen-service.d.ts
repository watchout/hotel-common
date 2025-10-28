import type { WelcomeScreenConfig } from './types';
export declare class WelcomeScreenService {
    private cache;
    getWelcomeScreenConfig(languageCode: string): Promise<WelcomeScreenConfig>;
    shouldShowWelcomeScreen(userId: string | undefined, deviceId: string): Promise<boolean>;
    markWelcomeScreenCompleted(userId: string | undefined, deviceId: string): Promise<void>;
    getVideoCacheSchedule(): Promise<{
        videoId: string;
        url: string;
        priority: number;
    }[]>;
    checkVideoUpdate(videoIds: string[]): Promise<{
        updatedVideoIds: string[];
    }>;
    getVideoById(id: string): Promise<{
        url: string;
    } | null>;
}
